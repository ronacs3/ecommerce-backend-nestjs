const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { totals } = require('../dist/pricing');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { OrderDto, RegisterDto } = require('../dist/dto');
const { AuthGuard } = require('../dist/auth');
const item = (category, price, qty = 1) => ({ product: 'test', name: 'test', image: '', category, price, qty });
test('category coupon does not discount other categories, shipping or VAT', () => {
  assert.deepEqual(totals([item('A',100000,2),item('B',300000)],50,['A']), {itemsPrice:500000,shippingPrice:30000,taxPrice:50000,discountAmount:100000,totalPrice:480000});
});
test('free shipping threshold is strictly above 10 million', () => {
  assert.equal(totals([item('A',10000000)]).shippingPrice,30000);
  assert.equal(totals([item('A',10000001)]).shippingPrice,0);
});
test('global coupon rounds currency consistently', () => {
  assert.equal(totals([item('A',12345),item('B',23456)],15).totalPrice,64010.85);
});
const order = () => ({ orderItems: [{product:'12345678-1234-4234-8234-123456789abc',qty:2,price:1}], shippingAddress:{address:'123 Street',city:'Hanoi',country:'VN'},paymentMethod:'COD', totalPrice:1 });
test('order validation strips client prices and totals', async () => {
  const dto = plainToInstance(OrderDto,order());
  assert.equal((await validate(dto,{whitelist:true})).length,0);
  assert.equal(dto.totalPrice,undefined);
  assert.equal(dto.orderItems[0].price,undefined);
});
test('rejects missing address, invalid IDs and negative quantities', async () => {
  for (const mutate of [o=>delete o.shippingAddress,o=>o.orderItems[0].qty=-1,o=>o.orderItems[0].product='invalid',o=>o.orderItems=[]]) {
    const value=order(); mutate(value);
    assert.ok((await validate(plainToInstance(OrderDto,value),{whitelist:true})).length>0);
  }
});
test('registration cannot set admin privileges and requires strong enough password', async () => {
  const dto=plainToInstance(RegisterDto,{name:'Customer',email:'test@example.com',password:'password123',isAdmin:true});
  assert.equal((await validate(dto,{whitelist:true})).length,0);
  assert.equal(dto.isAdmin,undefined);
  dto.password='short'; assert.ok((await validate(dto)).length>0);
});
const ctx = req => ({ getHandler:()=>null,getClass:()=>null,switchToHttp:()=>({getRequest:()=>req}) });
test('auth guard rejects invalid token and deleted account', async () => {
  const reflector={getAllAndOverride:()=>false};
  const guard=new AuthGuard(reflector,{verifyAsync:async()=>{throw Error();}},{});
  await assert.rejects(guard.canActivate(ctx({headers:{authorization:'Bearer invalid'}})),e=>e.status===401);
  const deleted=new AuthGuard(reflector,{verifyAsync:async()=>({sub:'id'})},{getRepository:()=>({findOneBy:async()=>null})});
  await assert.rejects(deleted.canActivate(ctx({headers:{authorization:'Bearer token'}})),e=>e.status===401);
});
test('admin guard reads current role from database', async () => {
  const reflector={getAllAndOverride:key=>key==='admin'};
  const guard=new AuthGuard(reflector,{verifyAsync:async()=>({sub:'id',isAdmin:true})},{getRepository:()=>({findOneBy:async()=>({_id:'id',isAdmin:false})})});
  await assert.rejects(guard.canActivate(ctx({headers:{authorization:'Bearer token'}})),e=>e.status===403);
});

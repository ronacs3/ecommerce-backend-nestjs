import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entities';
import { InitialSchema1730000000000 } from './migrations/initial';

export const database = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  synchronize: false,
  migrations: [InitialSchema1730000000000],
});

export default database;

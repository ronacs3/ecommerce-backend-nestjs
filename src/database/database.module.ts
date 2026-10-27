import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { database } from './data-source';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        if (!database.isInitialized) {
          await database.initialize();
        }
        return database;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}

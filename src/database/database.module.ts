import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';

import config from '../config';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigType<typeof config>) => {
        const { connection, host, port, user, password, dbName } =
          configService.mongo;

        return {
          uri: `${connection}://${host}:${port}`,
          /* user: user,
          pass: password, */
          dbName: dbName,
        };
      },
      inject: [config.KEY],
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
    /* {  //Conexión si Mongoose solo con driver
      provide: 'MONGO',
      useFactory: async (configService: ConfigType<typeof config>) => {
        const { connection, host, port, user, password, dbName } =
          configService.mongo;
        const uri = `${connection}://${host}:${port}/?readPreference=primary`;
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        const database = client.db(dbName);
        return database;
      },
      inject: [config.KEY],
    }, */
  ],
  exports: ['API_KEY', /* 'MONGO', */ MongooseModule],
})
export class DatabaseModule {}

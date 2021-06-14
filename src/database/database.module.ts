import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '../config';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, dbName, password, port } = configService.postgres; //type: 'postgres'
        //const { user, host, dbName, password, port } = configService.mysql; //type: 'mysql'
        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
          synchronize: true, //Solo puede ser true durante el desarrollo esto lo que hace es que si no existe tabla la cree
          autoLoadEntities: true, //Solo puede ser true durante el desarrollo esto lo que hace es que si no existe tabla la cree
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
  ],
  exports: ['API_KEY', TypeOrmModule],
})
export class DatabaseModule {}

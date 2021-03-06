import { Module, Global } from '@nestjs/common';

const API_KEY = '1234';
const API_KEY_PROD = 'PROD1234';

@Global()
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY : API_KEY_PROD,
    },
  ],
  exports: ['API_KEY'],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env.local'),
        join(__dirname, '..', '.env'),
        '.env.local',
        '.env',
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 900000, // 15 minutes in ms
      max: 100,
    }),
    SearchModule,
  ],
})
export class AppModule {}

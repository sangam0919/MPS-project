// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';   
import biznoConfig from '../bizno.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { MeModule } from './client/me/me.module';
import { DbModule } from './db/db.module';
import { ExploreModule } from './client/explore/explore.module';
import { TagsModule } from './client/tags/tags.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/backend/.env'),
        join(__dirname, '../../.env'),
        '.env',
      ],
      load: [biznoConfig],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '30d' },
    }),

    ScheduleModule.forRoot({
      timezone: 'Asia/Seoul',
    } as any),

    // 기존 모듈들
    ClientModule,
    MeModule,
    DbModule,
    ExploreModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

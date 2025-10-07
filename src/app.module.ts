import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from 'config/database.config';
import defaultConfig from 'config/default.config';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './payment/payment.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationInterceptor } from 'common/interceptors/authentication.interceptor';
import { Payment } from './payment/entities/payment.entity';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { LoggingInterceptor } from 'common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, defaultConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY],
      useFactory: async (dbConfig: ConfigType<typeof databaseConfig>) => ({
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [Payment],
        synchronize: dbConfig.synchronize,
      }),
    }),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthenticationInterceptor,
    },
  ],
})
export class AppModule {}

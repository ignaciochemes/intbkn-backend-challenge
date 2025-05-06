import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { QueryFailedErrorFilter } from '../Middlewares/QueryFailedErrorFilter';
import { envFilePathConfiguration } from '../Config/EnvFilePathConfig';
import { nestEnvConfiguration } from '../Config/NestEnvConfig';
import { DBConfigInterface } from '../Config/DbConfigInterface';
import { ApplicationModule } from './ApplicationModule';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [envFilePathConfiguration()],
            load: [nestEnvConfiguration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) =>
                Object.assign({}, configService.get<DBConfigInterface>('DATABASE') || {}),
        }),
        ApplicationModule,
    ],
    providers: [{ provide: APP_FILTER, useClass: QueryFailedErrorFilter }],
})
export class AppModule { }
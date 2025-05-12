import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './Infrastructure/Modules/AppModule';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecurityHeadersMiddleware } from './Infrastructure/Middlewares/SecurityHeadersMiddleware';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true, // Habilita la transformación automática
            transformOptions: {
                enableImplicitConversion: false, // Evita conversiones implícitas
            },
            stopAtFirstError: false, // Recoge todos los errores, no solo el primero
            exceptionFactory: (errors) => {
                // Personaliza los mensajes de error para mayor claridad
                const formattedErrors = errors.map(error => {
                    const constraints = error.constraints;
                    return {
                        property: error.property,
                        value: error.value,
                        constraints: constraints ? Object.values(constraints) : []
                    };
                });
                return new BadRequestException({
                    message: 'Validation failed',
                    errors: formattedErrors
                });
            }
        }),
    );

    app.use(helmet());
    app.use(new SecurityHeadersMiddleware().use);
    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
    app.setGlobalPrefix('api/v1/backend-challenge');
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGIN') || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    });

    const config = new DocumentBuilder()
        .setTitle('Backend Challenge API')
        .setDescription(`
        # API para Gestión de Empresas y Transferencias
        
        Esta API proporciona endpoints para la gestión de empresas y transferencias bancarias, 
        siguiendo los principios de la arquitectura hexagonal.
        
        ## Principales Características
        
        * Gestión completa de empresas (adhesión, consulta)
        * Gestión de transferencias entre cuentas
        * Consultas de empresas por diferentes criterios
        * Reportes de transferencias por empresa
    `)
        .setVersion('1.0')
        .addTag('companies', 'Operaciones relacionadas con empresas')
        .addTag('transfers', 'Operaciones relacionadas con transferencias')
        .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = configService.get<number>('PORT') || 33000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
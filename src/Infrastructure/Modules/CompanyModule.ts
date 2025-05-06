import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../Entities/CompanyEntity';
import { CompanyController } from '../Controllers/CompanyController';
import { COMPANY_REPOSITORY, COMPANY_SERVICE } from '../../Shared/Constants/InjectionTokens';
import { CompanyRepository } from '../Repositories/CompanyRepository';
import { CompanyService } from '../../Application/Services/CompanyService';

@Module({
    imports: [
        TypeOrmModule.forFeature([CompanyEntity])
    ],
    controllers: [CompanyController],
    providers: [
        {
            provide: COMPANY_REPOSITORY,
            useClass: CompanyRepository,
        },
        {
            provide: COMPANY_SERVICE,
            useClass: CompanyService,
        },
    ],
    exports: [COMPANY_SERVICE, COMPANY_REPOSITORY],
})
export class CompanyModule { }
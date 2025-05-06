import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferEntity } from '../Entities/TransferEntity';
import { CompanyModule } from './CompanyModule';
import { TransferController } from '../Controllers/TransferController';
import { TRANSFER_REPOSITORY, TRANSFER_SERVICE } from '../../Shared/Constants/InjectionTokens';
import { TransferRepository } from '../Repositories/TransferRepository';
import { TransferService } from '../../Application/Services/TransferService';

@Module({
    imports: [
        TypeOrmModule.forFeature([TransferEntity]),
        CompanyModule
    ],
    controllers: [TransferController],
    providers: [
        {
            provide: TRANSFER_REPOSITORY,
            useClass: TransferRepository,
        },
        {
            provide: TRANSFER_SERVICE,
            useClass: TransferService,
        },
    ],
    exports: [TRANSFER_SERVICE, TRANSFER_REPOSITORY],
})
export class TransferModule { }
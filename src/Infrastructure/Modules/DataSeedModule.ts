import { Module } from '@nestjs/common';
import { DataSeedService } from '../../Application/Services/DataSeedService';
import { CompanyModule } from './CompanyModule';
import { TransferModule } from './TransferModule';

@Module({
    imports: [
        CompanyModule,
        TransferModule
    ],
    providers: [
        DataSeedService
    ],
    exports: [DataSeedService],
})
export class DataSeedModule { }
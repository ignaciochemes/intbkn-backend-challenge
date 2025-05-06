import { Module } from "@nestjs/common";
import { CompanyModule } from "./CompanyModule";
import { TransferModule } from "./TransferModule";
import { DataSeedModule } from "./DataSeedModule";

@Module({
    imports: [
        CompanyModule,
        TransferModule,
        DataSeedModule,
    ],
    exports: [CompanyModule, TransferModule],
})
export class ApplicationModule { }
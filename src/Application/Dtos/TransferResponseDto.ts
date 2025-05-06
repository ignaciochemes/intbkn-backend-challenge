import { TransferStatus } from "../../Shared/Enums/TransferStatusEnum";
import { CompanyResponseDto } from "./CompanyResponseDto";

export class TransferResponseDto {
    id: number;
    uuid: string;
    amount: number;
    company: Partial<CompanyResponseDto>;
    debitAccount: string;
    creditAccount: string;
    transferDate: Date;
    status: TransferStatus;
    description?: string;
    referenceId?: string;
    processedDate?: Date;
    currency: string;
    createdAt: Date;
}
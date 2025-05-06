import { Transfer } from "../../Entities/Transfer";
import { TransferStatus } from "../../../Shared/Enums/TransferStatusEnum";

export interface ITransferRepository {
    save(transfer: Transfer): Promise<Transfer>;
    findAll(page?: number | string, limit?: number | string): Promise<[Transfer[], number]>;
    findById(id: string): Promise<Transfer | null>;
    findByCompanyId(companyId: string): Promise<Transfer[]>;
    findCompaniesWithTransfersLastMonth(): Promise<string[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]>;
    findByAmountRange(minAmount: number, maxAmount: number): Promise<Transfer[]>;
    findByStatus(status: TransferStatus): Promise<Transfer[]>;
    count(): Promise<number>;
    softDelete(id: string): Promise<boolean>;
    updateStatus(id: string, status: TransferStatus): Promise<Transfer | null>;
}
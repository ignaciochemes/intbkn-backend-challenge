import { Company } from './Company';
import { TransferStatus } from '../../Shared/Enums/TransferStatusEnum';

export class Transfer {
    private id: number;
    private uuid: string;
    private amount: number;
    private companyId: Company;
    private debitAccount: string;
    private creditAccount: string;
    private transferDate: Date;
    private status: TransferStatus;
    private description?: string;
    private referenceId?: string;
    private processedDate?: Date;
    private currency: string;
    private createdAt: Date;
    private updatedAt: Date;
    private deletedAt?: Date;

    constructor() {
        this.status = TransferStatus.PENDING;
        this.currency = 'ARS';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.transferDate = new Date();
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public getUuid(): string {
        return this.uuid;
    }

    public setUuid(uuid: string): void {
        this.uuid = uuid;
    }

    public getAmount(): number {
        return this.amount;
    }

    public setAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error('Transfer amount must be greater than zero');
        }
        this.amount = amount;
    }

    public getCompanyId(): Company {
        return this.companyId;
    }

    public setCompanyId(companyId: Company): void {
        this.companyId = companyId;
    }

    public getDebitAccount(): string {
        return this.debitAccount;
    }

    public setDebitAccount(debitAccount: string): void {
        this.debitAccount = debitAccount ? debitAccount.replace(/\D/g, '') : debitAccount;
    }

    public getCreditAccount(): string {
        return this.creditAccount;
    }

    public setCreditAccount(creditAccount: string): void {
        this.creditAccount = creditAccount ? creditAccount.replace(/\D/g, '') : creditAccount;
    }

    public getTransferDate(): Date {
        return this.transferDate;
    }

    public setTransferDate(transferDate: Date): void {
        this.transferDate = transferDate;
    }

    public getStatus(): TransferStatus {
        return this.status;
    }

    public setStatus(status: TransferStatus): void {
        this.status = status;
        if ((status === TransferStatus.COMPLETED || status === TransferStatus.FAILED) && !this.processedDate) {
            this.processedDate = new Date();
        }
    }

    public getDescription(): string | undefined {
        return this.description;
    }

    public setDescription(description: string | null): void {
        this.description = description || undefined;
    }

    public getReferenceId(): string | undefined {
        return this.referenceId;
    }

    public setReferenceId(referenceId: string | null): void {
        this.referenceId = referenceId || undefined;
    }

    public getProcessedDate(): Date | undefined {
        return this.processedDate;
    }

    public setProcessedDate(processedDate: Date | null): void {
        this.processedDate = processedDate || undefined;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public setCurrency(currency: string | null): void {
        this.currency = currency || 'ARS';
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public setCreatedAt(createdAt: Date): void {
        this.createdAt = createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public setUpdatedAt(updatedAt: Date): void {
        this.updatedAt = updatedAt;
    }

    public getDeletedAt(): Date | undefined {
        return this.deletedAt;
    }

    public setDeletedAt(deletedAt: Date | null): void {
        this.deletedAt = deletedAt || undefined;
    }

    public validateTransfer(): boolean {
        if (this.amount <= 0) {
            throw new Error('Transfer amount must be greater than zero');
        }
        if (this.debitAccount === this.creditAccount) {
            throw new Error('Debit and credit accounts cannot be the same');
        }
        return true;
    }
}
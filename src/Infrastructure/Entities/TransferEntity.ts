import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CompanyEntity } from "./CompanyEntity";
import { TransferStatus } from "../../Shared/Enums/TransferStatusEnum";

@Entity('transfer')
// Índice simple por fecha
@Index('idx_transfer_date', ['transferDate'])
// Índice compuesto para consultas de transferencias por fecha
@Index('idx_transfer_date_status', ['transferDate', 'status'])
// Índice para búsquedas de transferencias por compañía y fecha
@Index('idx_transfer_company_date', ['companyId', 'transferDate'])
export class TransferEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ nullable: false, type: 'uuid' })
    uuid: string;

    @Column({
        nullable: false,
        type: 'numeric',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: {
            to: (value: number) => Math.abs(value),
            from: (value: string) => parseFloat(value)
        }
    })
    amount: number;

    @ManyToOne(() => CompanyEntity, (company) => company.id, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'company_id' })
    @Index('idx_transfer_company_id')
    companyId: CompanyEntity;

    @Column({ nullable: false, length: 50, name: 'debit_account' })
    debitAccount: string;

    @Column({ nullable: false, length: 50, name: 'credit_account' })
    creditAccount: string;

    @Column({ nullable: false, type: 'timestamp', name: 'transfer_date' })
    transferDate: Date;

    @Column({
        nullable: false,
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
        name: 'status'
    })
    @Index('idx_transfer_status')
    status: TransferStatus;

    @Column({ nullable: true, type: 'text', name: 'description' })
    description: string;

    @Column({ nullable: true, type: 'text', name: 'reference_id' })
    @Index('idx_transfer_reference_id')
    referenceId: string;

    @Column({ nullable: true, type: 'timestamp', name: 'processed_date' })
    processedDate: Date;

    @Column({ nullable: true, length: 50, name: 'currency', default: 'ARS' })
    currency: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: true, name: 'deleted_at', type: 'timestamp' })
    deletedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    validateData() {
        if (this.amount <= 0) {
            throw new Error('Transfer amount must be greater than zero');
        }
        if (this.debitAccount === this.creditAccount) {
            throw new Error('Debit and credit accounts cannot be the same');
        }
        this.debitAccount = this.debitAccount.replace(/\D/g, '');
        this.creditAccount = this.creditAccount.replace(/\D/g, '');

        if (
            (this.status === TransferStatus.COMPLETED || this.status === TransferStatus.FAILED) &&
            !this.processedDate
        ) {
            this.processedDate = new Date();
        }
    }
}
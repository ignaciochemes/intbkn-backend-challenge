import { Transfer } from '../../../../src/Domain/Entities/Transfer';
import { Company } from '../../../../src/Domain/Entities/Company';
import { TransferStatus } from '../../../../src/Shared/Enums/TransferStatusEnum';

describe('Transfer Entity', () => {
    let transfer: Transfer;
    let company: Company;

    beforeEach(() => {
        transfer = new Transfer();
        company = new Company();
        company.setId(1);
        company.setUuid('test-uuid-1234');
        company.setBusinessName('Test Company');
    });

    it('should have default values when instantiated', () => {
        expect(transfer.getStatus()).toBe(TransferStatus.PENDING);
        expect(transfer.getCurrency()).toBe('ARS');
        expect(transfer.getCreatedAt()).toBeInstanceOf(Date);
        expect(transfer.getUpdatedAt()).toBeInstanceOf(Date);
        expect(transfer.getTransferDate()).toBeInstanceOf(Date);
    });

    it('should validate amount is greater than zero', () => {
        expect(() => transfer.setAmount(-100)).toThrow('Transfer amount must be greater than zero');
        expect(() => transfer.setAmount(0)).toThrow('Transfer amount must be greater than zero');

        transfer.setAmount(100);
        expect(transfer.getAmount()).toBe(100);
    });

    it('should format account numbers', () => {
        transfer.setDebitAccount('ABC12345678');
        transfer.setCreditAccount('DEF87654321');

        expect(transfer.getDebitAccount()).toBe('12345678');
        expect(transfer.getCreditAccount()).toBe('87654321');
    });

    it('should handle company relation correctly', () => {
        transfer.setCompanyId(company);

        expect(transfer.getCompanyId()).toBe(company);
    });

    it('should update processedDate when status changes to COMPLETED', () => {
        expect(transfer.getProcessedDate()).toBeUndefined();

        transfer.setStatus(TransferStatus.COMPLETED);

        expect(transfer.getProcessedDate()).toBeInstanceOf(Date);
    });

    it('should update processedDate when status changes to FAILED', () => {
        expect(transfer.getProcessedDate()).toBeUndefined();

        transfer.setStatus(TransferStatus.FAILED);

        expect(transfer.getProcessedDate()).toBeInstanceOf(Date);
    });

    it('should validate transfer correctly', () => {
        transfer.setAmount(100);
        transfer.setDebitAccount('12345678');
        transfer.setCreditAccount('87654321');

        expect(transfer.validateTransfer()).toBe(true);

        transfer.setCreditAccount('12345678');

        expect(() => transfer.validateTransfer()).toThrow('Debit and credit accounts cannot be the same');
    });

    it('should handle optional fields correctly', () => {
        expect(transfer.getDescription()).toBeUndefined();
        expect(transfer.getReferenceId()).toBeUndefined();
        expect(transfer.getProcessedDate()).toBeUndefined();

        transfer.setDescription('Test description');
        transfer.setReferenceId('REF-001');
        const processedDate = new Date();
        transfer.setProcessedDate(processedDate);

        expect(transfer.getDescription()).toBe('Test description');
        expect(transfer.getReferenceId()).toBe('REF-001');
        expect(transfer.getProcessedDate()).toEqual(processedDate);
    });

    it('should set null values to undefined for optional fields', () => {
        transfer.setDescription('Test');
        transfer.setReferenceId('REF');
        transfer.setProcessedDate(new Date());

        transfer.setDescription(null);
        transfer.setReferenceId(null);
        transfer.setProcessedDate(null);

        expect(transfer.getDescription()).toBeUndefined();
        expect(transfer.getReferenceId()).toBeUndefined();
        expect(transfer.getProcessedDate()).toBeUndefined();
    });
});
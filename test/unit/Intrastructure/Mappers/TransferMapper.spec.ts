import { TransferMapper } from '../../../../src/Infrastructure/Mappers/TransferMapper';
import { TransferEntity } from '../../../../src/Infrastructure/Entities/TransferEntity';
import { Transfer } from '../../../../src/Domain/Entities/Transfer';
import { CompanyEntity } from '../../../../src/Infrastructure/Entities/CompanyEntity';
import { Company } from '../../../../src/Domain/Entities/Company';
import { TransferStatus } from '../../../../src/Shared/Enums/TransferStatusEnum';
import { CompanyMapper } from '../../../../src/Infrastructure/Mappers/CompanyMapper';

jest.mock('../../../../src/Infrastructure/Mappers/CompanyMapper', () => ({
    CompanyMapper: {
        toDomain: jest.fn(),
        toEntity: jest.fn(),
    },
}));

describe('TransferMapper', () => {
    let mockCompanyEntity: CompanyEntity;
    let mockCompanyDomain: Company;

    beforeEach(() => {
        mockCompanyEntity = new CompanyEntity();
        mockCompanyEntity.id = 1;
        mockCompanyEntity.uuid = 'test-uuid-1234';
        mockCompanyEntity.businessName = 'Test Company';

        mockCompanyDomain = new Company();
        mockCompanyDomain.setId(1);
        mockCompanyDomain.setUuid('test-uuid-1234');
        mockCompanyDomain.setBusinessName('Test Company');

        (CompanyMapper.toDomain as jest.Mock).mockReturnValue(mockCompanyDomain);
        (CompanyMapper.toEntity as jest.Mock).mockReturnValue(mockCompanyEntity);
    });

    const createTransferEntity = (): TransferEntity => {
        const entity = new TransferEntity();
        entity.id = 1;
        entity.uuid = 'transfer-uuid-1234';
        entity.amount = 1000;
        entity.companyId = mockCompanyEntity;
        entity.debitAccount = '12345678';
        entity.creditAccount = '87654321';
        entity.transferDate = new Date('2025-04-15T10:30:00Z');
        entity.status = TransferStatus.COMPLETED;
        entity.description = 'Test description';
        entity.referenceId = 'REF-001';
        entity.processedDate = new Date('2025-04-15T10:35:00Z');
        entity.currency = 'ARS';
        entity.createdAt = new Date('2025-04-15T10:30:00Z');
        entity.updatedAt = new Date('2025-04-15T10:30:00Z');
        entity.deletedAt = null;
        return entity;
    };

    const createTransferDomain = (): Transfer => {
        const domain = new Transfer();
        domain.setId(1);
        domain.setUuid('transfer-uuid-1234');
        domain.setAmount(1000);
        domain.setCompanyId(mockCompanyDomain);
        domain.setDebitAccount('12345678');
        domain.setCreditAccount('87654321');
        domain.setTransferDate(new Date('2025-04-15T10:30:00Z'));
        domain.setStatus(TransferStatus.COMPLETED);
        domain.setDescription('Test description');
        domain.setReferenceId('REF-001');
        domain.setProcessedDate(new Date('2025-04-15T10:35:00Z'));
        domain.setCurrency('ARS');
        domain.setCreatedAt(new Date('2025-04-15T10:30:00Z'));
        domain.setUpdatedAt(new Date('2025-04-15T10:30:00Z'));
        domain.setDeletedAt(null);
        return domain;
    };

    describe('toDomain', () => {
        it('should convert entity to domain model', () => {
            const entity = createTransferEntity();
            const domain = TransferMapper.toDomain(entity);

            expect(domain).toBeInstanceOf(Transfer);
            expect(domain.getId()).toBe(entity.id);
            expect(domain.getUuid()).toBe(entity.uuid);
            expect(domain.getAmount()).toBe(entity.amount);
            expect(CompanyMapper.toDomain).toHaveBeenCalledWith(entity.companyId);
            expect(domain.getCompanyId()).toBe(mockCompanyDomain);
            expect(domain.getDebitAccount()).toBe(entity.debitAccount);
            expect(domain.getCreditAccount()).toBe(entity.creditAccount);
            expect(domain.getTransferDate()).toEqual(entity.transferDate);
            expect(domain.getStatus()).toBe(entity.status);
            expect(domain.getDescription()).toBe(entity.description);
            expect(domain.getReferenceId()).toBe(entity.referenceId);
            expect(domain.getProcessedDate()).toEqual(entity.processedDate);
            expect(domain.getCurrency()).toBe(entity.currency);
            expect(domain.getCreatedAt()).toEqual(entity.createdAt);
            expect(domain.getUpdatedAt()).toEqual(entity.updatedAt);
            expect(domain.getDeletedAt()).toEqual(entity.deletedAt);
        });

        it('should return null when entity is null', () => {
            const domain = TransferMapper.toDomain(null);
            expect(domain).toBeNull();
        });
    });

    describe('toEntity', () => {
        it('should convert domain model to entity', () => {
            const domain = createTransferDomain();
            const entity = TransferMapper.toEntity(domain);

            expect(entity).toBeInstanceOf(TransferEntity);
            expect(entity.id).toBe(domain.getId());
            expect(entity.uuid).toBe(domain.getUuid());
            expect(entity.amount).toBe(domain.getAmount());
            expect(CompanyMapper.toEntity).toHaveBeenCalledWith(domain.getCompanyId());
            expect(entity.companyId).toBe(mockCompanyEntity);
            expect(entity.debitAccount).toBe(domain.getDebitAccount());
            expect(entity.creditAccount).toBe(domain.getCreditAccount());
            expect(entity.transferDate).toEqual(domain.getTransferDate());
            expect(entity.status).toBe(domain.getStatus());
            expect(entity.description).toBe(domain.getDescription());
            expect(entity.referenceId).toBe(domain.getReferenceId());
            expect(entity.processedDate).toEqual(domain.getProcessedDate());
            expect(entity.currency).toBe(domain.getCurrency());
            expect(entity.createdAt).toEqual(domain.getCreatedAt());
            expect(entity.updatedAt).toEqual(domain.getUpdatedAt());
            expect(entity.deletedAt).toEqual(domain.getDeletedAt());
        });

        it('should return null when domain is null', () => {
            const entity = TransferMapper.toEntity(null);
            expect(entity).toBeNull();
        });
    });
});
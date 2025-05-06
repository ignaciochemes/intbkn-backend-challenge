import { CompanyMapper } from '../../../../src/Infrastructure/Mappers/CompanyMapper';
import { CompanyEntity } from '../../../../src/Infrastructure/Entities/CompanyEntity';
import { Company } from '../../../../src/Domain/Entities/Company';

describe('CompanyMapper', () => {
    const createCompanyEntity = (): CompanyEntity => {
        const entity = new CompanyEntity();
        entity.id = 1;
        entity.uuid = 'test-uuid-1234';
        entity.cuit = '30-71659554-9';
        entity.businessName = 'Test Company';
        entity.adhesionDate = new Date('2025-04-15T10:30:00Z');
        entity.address = 'Test Address';
        entity.contactEmail = 'test@example.com';
        entity.contactPhone = '1234567890';
        entity.isActive = true;
        entity.createdAt = new Date('2025-04-15T10:30:00Z');
        entity.updatedAt = new Date('2025-04-15T10:30:00Z');
        entity.deletedAt = null;
        return entity;
    };

    const createCompanyDomain = (): Company => {
        const domain = new Company();
        domain.setId(1);
        domain.setUuid('test-uuid-1234');
        domain.setCuit('30-71659554-9');
        domain.setBusinessName('Test Company');
        domain.setAdhesionDate(new Date('2025-04-15T10:30:00Z'));
        domain.setAddress('Test Address');
        domain.setContactEmail('test@example.com');
        domain.setContactPhone('1234567890');
        domain.setIsActive(true);
        domain.setCreatedAt(new Date('2025-04-15T10:30:00Z'));
        domain.setUpdatedAt(new Date('2025-04-15T10:30:00Z'));
        domain.setDeletedAt(null);
        return domain;
    };

    describe('toDomain', () => {
        it('should convert entity to domain model', () => {
            const entity = createCompanyEntity();
            const domain = CompanyMapper.toDomain(entity);

            expect(domain).toBeInstanceOf(Company);
            expect(domain.getId()).toBe(entity.id);
            expect(domain.getUuid()).toBe(entity.uuid);
            expect(domain.getCuit()).toBe(entity.cuit);
            expect(domain.getBusinessName()).toBe(entity.businessName);
            expect(domain.getAdhesionDate()).toEqual(entity.adhesionDate);
            expect(domain.getAddress()).toBe(entity.address);
            expect(domain.getContactEmail()).toBe(entity.contactEmail);
            expect(domain.getContactPhone()).toBe(entity.contactPhone);
            expect(domain.getIsActive()).toBe(entity.isActive);
            expect(domain.getCreatedAt()).toEqual(entity.createdAt);
            expect(domain.getUpdatedAt()).toEqual(entity.updatedAt);
            expect(domain.getDeletedAt()).toEqual(entity.deletedAt);
        });
    });

    describe('toEntity', () => {
        it('should convert domain model to entity', () => {
            const domain = createCompanyDomain();
            const entity = CompanyMapper.toEntity(domain);

            expect(entity).toBeInstanceOf(CompanyEntity);
            expect(entity.id).toBe(domain.getId());
            expect(entity.uuid).toBe(domain.getUuid());
            expect(entity.cuit).toBe(domain.getCuit());
            expect(entity.businessName).toBe(domain.getBusinessName());
            expect(entity.adhesionDate).toEqual(domain.getAdhesionDate());
            expect(entity.address).toBe(domain.getAddress());
            expect(entity.contactEmail).toBe(domain.getContactEmail());
            expect(entity.contactPhone).toBe(domain.getContactPhone());
            expect(entity.isActive).toBe(domain.getIsActive());
            expect(entity.createdAt).toEqual(domain.getCreatedAt());
            expect(entity.updatedAt).toEqual(domain.getUpdatedAt());
            expect(entity.deletedAt).toEqual(domain.getDeletedAt());
        });
    });
});
import { Company } from '../../Domain/Entities/Company';
import { CompanyEntity } from '../Entities/CompanyEntity';

export class CompanyMapper {
    public static toDomain(entity: CompanyEntity): Company {
        const domain = new Company();
        domain.setId(entity.id);
        domain.setUuid(entity.uuid);
        domain.setCuit(entity.cuit);
        domain.setBusinessName(entity.businessName);
        domain.setAdhesionDate(entity.adhesionDate);
        domain.setAddress(entity.address);
        domain.setContactEmail(entity.contactEmail);
        domain.setContactPhone(entity.contactPhone);
        domain.setIsActive(entity.isActive);
        domain.setCreatedAt(entity.createdAt);
        domain.setUpdatedAt(entity.updatedAt);
        domain.setDeletedAt(entity.deletedAt);
        return domain;
    }

    public static toEntity(domain: Company): CompanyEntity {
        const entity = new CompanyEntity();
        entity.id = domain.getId();
        entity.uuid = domain.getUuid();
        entity.cuit = domain.getCuit();
        entity.businessName = domain.getBusinessName();
        entity.adhesionDate = domain.getAdhesionDate();
        entity.address = domain.getAddress();
        entity.contactEmail = domain.getContactEmail();
        entity.contactPhone = domain.getContactPhone();
        entity.isActive = domain.getIsActive();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        entity.deletedAt = domain.getDeletedAt();
        return entity;
    }
}
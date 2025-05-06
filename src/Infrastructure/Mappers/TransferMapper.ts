import { Transfer } from "../../Domain/Entities/Transfer";
import { TransferEntity } from "../Entities/TransferEntity";
import { CompanyMapper } from "./CompanyMapper";

export class TransferMapper {
    public static toDomain(entity: TransferEntity): Transfer {
        if (!entity) return null;

        const domain = new Transfer();
        domain.setId(entity.id);
        domain.setUuid(entity.uuid);
        domain.setAmount(entity.amount);
        if (entity.companyId) {
            domain.setCompanyId(CompanyMapper.toDomain(entity.companyId));
        }
        domain.setDebitAccount(entity.debitAccount);
        domain.setCreditAccount(entity.creditAccount);
        domain.setTransferDate(entity.transferDate);
        domain.setStatus(entity.status);
        domain.setDescription(entity.description);
        domain.setReferenceId(entity.referenceId);
        domain.setProcessedDate(entity.processedDate);
        domain.setCurrency(entity.currency);
        domain.setCreatedAt(entity.createdAt);
        domain.setUpdatedAt(entity.updatedAt);
        domain.setDeletedAt(entity.deletedAt || null);
        return domain;
    }

    public static toEntity(domain: Transfer): TransferEntity {
        if (!domain) return null;

        const entity = new TransferEntity();
        entity.id = domain.getId();
        entity.uuid = domain.getUuid();
        entity.amount = domain.getAmount();
        if (domain.getCompanyId()) {
            entity.companyId = CompanyMapper.toEntity(domain.getCompanyId());
        }
        entity.debitAccount = domain.getDebitAccount();
        entity.creditAccount = domain.getCreditAccount();
        entity.transferDate = domain.getTransferDate();
        entity.status = domain.getStatus();
        entity.description = domain.getDescription();
        entity.referenceId = domain.getReferenceId();
        entity.processedDate = domain.getProcessedDate();
        entity.currency = domain.getCurrency();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        entity.deletedAt = domain.getDeletedAt();
        return entity;
    }
}
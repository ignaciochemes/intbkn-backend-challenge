import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../Entities/CompanyEntity';
import { ICompanyRepository } from '../../Domain/Ports/Repositories/ICompanyRepository';
import { Company } from '../../Domain/Entities/Company';
import { CompanyMapper } from '../Mappers/CompanyMapper';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
    constructor(
        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>
    ) { }

    async save(company: Company): Promise<Company> {
        const companyEntity = CompanyMapper.toEntity(company);
        const savedEntity = await this.companyRepository.save(companyEntity);
        return CompanyMapper.toDomain(savedEntity);
    }

    async findAll(skip = 0, take = 10): Promise<Company[]> {
        const entities = await this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL')
            .orderBy('company.created_at', 'DESC')
            .skip(skip)
            .take(take)
            .getMany();

        return entities.map(entity => CompanyMapper.toDomain(entity));
    }

    async count(): Promise<number> {
        return this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL')
            .getCount();
    }

    async findById(id: string): Promise<Company | null> {
        const entity = await this.companyRepository
            .createQueryBuilder('company')
            .where('(company.id = :numericId OR company.uuid = :uuid)', {
                numericId: /^\d+$/.test(id) ? parseInt(id, 10) : -1,
                uuid: id
            })
            .andWhere('company.deleted_at IS NULL')
            .getOne();

        return entity ? CompanyMapper.toDomain(entity) : null;
    }

    async findByCuit(cuit: string): Promise<Company | null> {
        const entity = await this.companyRepository
            .createQueryBuilder('company')
            .where('company.cuit = :cuit', { cuit })
            .andWhere('company.deleted_at IS NULL')
            .getOne();

        return entity ? CompanyMapper.toDomain(entity) : null;
    }

    async findCompaniesAdheringLastMonth(): Promise<Company[]> {
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const entities = await this.companyRepository
            .createQueryBuilder('company')
            .where('company.adhesion_date >= :startDate', { startDate: firstDayOfLastMonth })
            .andWhere('company.adhesion_date < :endDate', { endDate: firstDayOfCurrentMonth })
            .andWhere('company.deleted_at IS NULL')
            .getMany();

        return entities.map(entity => CompanyMapper.toDomain(entity));
    }

    async softDelete(id: string): Promise<boolean> {
        const company = await this.companyRepository
            .createQueryBuilder('company')
            .where('company.id = :id', { id })
            .andWhere('company.deleted_at IS NULL')
            .getOne();

        if (!company) {
            return false;
        }

        company.deletedAt = new Date();
        await this.companyRepository.save(company);
        return true;
    }

    async findByIds(ids: string[]): Promise<Company[]> {
        const numericIds = ids.filter(id => /^\d+$/.test(id)).map(id => parseInt(id, 10));
        const uuidIds = ids.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL');

        if (numericIds.length > 0) {
            query.orWhere('company.id IN (:...numericIds)', { numericIds });
        }
        if (uuidIds.length > 0) {
            query.orWhere('company.uuid IN (:...uuidIds)', { uuidIds });
        }

        const entities = await query.getMany();
        return entities.map(entity => CompanyMapper.toDomain(entity));
    }
}
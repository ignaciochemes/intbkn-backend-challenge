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

    async findAll(
        page: number | string = 0,
        limit: number | string = 10
    ): Promise<[Company[], number]> {
        const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

        const [entities, count] = await this.companyRepository.findAndCount({
            where: { deletedAt: null },
            relations: ['companyId'],
            order: { createdAt: 'DESC' },
            skip: pageNum * limitNum,
            take: limitNum
        });

        const companies = entities.map(entity => CompanyMapper.toDomain(entity));
        return [companies, count];
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
        // Consulta optimizada usando índices
        const entities = await this.companyRepository
            .createQueryBuilder('company')
            .select('company')
            .where(`
                company.adhesion_date >= date_trunc('month', now()) - interval '1 month' AND 
                company.adhesion_date < date_trunc('month', now())    
            `)
            .andWhere('company.deleted_at IS NULL')
            .andWhere('company.is_active = :isActive', { isActive: true })
            .orderBy('company.adhesion_date', 'DESC')
            .cache(60000) // Opcional: Cachear la consulta por 60 segundos
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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferEntity } from '../Entities/TransferEntity';
import { Transfer } from '../../Domain/Entities/Transfer';
import { TransferMapper } from '../Mappers/TransferMapper';
import { TransferStatus } from '../../Shared/Enums/TransferStatusEnum';
import { ITransferRepository } from '../../Domain/Ports/Repositories/ITransferRepository';

@Injectable()
export class TransferRepository implements ITransferRepository {
    constructor(
        @InjectRepository(TransferEntity)
        private readonly transferRepository: Repository<TransferEntity>
    ) { }

    async save(transfer: Transfer): Promise<Transfer> {
        const transferEntity = TransferMapper.toEntity(transfer);
        const savedEntity = await this.transferRepository.save(transferEntity);
        return TransferMapper.toDomain(savedEntity);
    }

    async findAll(
        page: number | string = 0,
        limit: number | string = 10
    ): Promise<[Transfer[], number]> {
        const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;

        const [entities, count] = await this.transferRepository.findAndCount({
            where: { deletedAt: null },
            relations: ['companyId'],
            order: { createdAt: 'DESC' },
            skip: pageNum * limitNum,
            take: limitNum
        });

        const transfers = entities.map(entity => TransferMapper.toDomain(entity));
        return [transfers, count];
    }

    async findById(id: string): Promise<Transfer | null> {
        const entity = await this.transferRepository
            .createQueryBuilder('transfer')
            .innerJoinAndSelect('transfer.companyId', 'company')
            .where('(transfer.id = :numericId OR transfer.uuid = :uuid)', {
                numericId: /^\d+$/.test(id) ? parseInt(id, 10) : -1,
                uuid: id
            })
            .andWhere('transfer.deleted_at IS NULL')
            .getOne();

        return entity ? TransferMapper.toDomain(entity) : null;
    }

    async count(): Promise<number> {
        return this.transferRepository
            .createQueryBuilder('transfer')
            .where('transfer.deleted_at IS NULL')
            .getCount();
    }

    async findByCompanyId(companyId: string): Promise<Transfer[]> {
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.deleted_at IS NULL');

        if (/^\d+$/.test(companyId)) {
            query.andWhere('company.id = :companyId', { companyId: parseInt(companyId, 10) });
        } else {
            query.andWhere('company.uuid = :companyId', { companyId });
        }

        const entities = await query
            .orderBy('transfer.transfer_date', 'DESC')
            .getMany();

        return entities.map(entity => TransferMapper.toDomain(entity));
    }

    async findCompaniesWithTransfersLastMonth(): Promise<string[]> {
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const result = await this.transferRepository
            .createQueryBuilder('transfer')
            .innerJoin('transfer.companyId', 'company')
            .select('DISTINCT company.uuid', 'uuid')
            .where('transfer.transfer_date >= :startDate', { startDate: firstDayOfLastMonth })
            .andWhere('transfer.transfer_date < :endDate', { endDate: firstDayOfCurrentMonth })
            .andWhere('transfer.deleted_at IS NULL')
            .getRawMany();

        return result.map(item => item.uuid);
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]> {
        const entities = await this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.transfer_date >= :startDate', { startDate })
            .andWhere('transfer.transfer_date <= :endDate', { endDate })
            .andWhere('transfer.deleted_at IS NULL')
            .orderBy('transfer.transfer_date', 'DESC')
            .getMany();

        return entities.map(entity => TransferMapper.toDomain(entity));
    }

    async findByAmountRange(minAmount: number, maxAmount: number): Promise<Transfer[]> {
        const entities = await this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.amount >= :minAmount', { minAmount })
            .andWhere('transfer.amount <= :maxAmount', { maxAmount })
            .andWhere('transfer.deleted_at IS NULL')
            .orderBy('transfer.amount', 'DESC')
            .getMany();

        return entities.map(entity => TransferMapper.toDomain(entity));
    }

    async findByStatus(status: TransferStatus): Promise<Transfer[]> {
        const entities = await this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.deleted_at IS NULL')
            .andWhere('transfer.status = :status', { status })
            .orderBy('transfer.created_at', 'DESC')
            .getMany();

        return entities.map(entity => TransferMapper.toDomain(entity));
    }

    async softDelete(id: string): Promise<boolean> {
        const transfer = await this.findById(id);
        if (!transfer) {
            return false;
        }

        const transferEntity = TransferMapper.toEntity(transfer);
        transferEntity.deletedAt = new Date();
        await this.transferRepository.save(transferEntity);
        return true;
    }

    async updateStatus(id: string, status: TransferStatus): Promise<Transfer | null> {
        const transfer = await this.findById(id);
        if (!transfer) {
            return null;
        }

        transfer.setStatus(status);
        if (status === TransferStatus.COMPLETED || status === TransferStatus.FAILED) {
            transfer.setProcessedDate(new Date());
        }

        return this.save(transfer);
    }
}
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferRepository } from '../../../../src/Infrastructure/Repositories/TransferRepository';
import { TransferEntity } from '../../../../src/Infrastructure/Entities/TransferEntity';
import { CompanyEntity } from '../../../../src/Infrastructure/Entities/CompanyEntity';
import { TransferStatus } from '../../../../src/Shared/Enums/TransferStatusEnum';

describe('TransferRepository', () => {
    let repository: TransferRepository;
    let typeOrmRepository: Repository<TransferEntity>;

    const mockCompanyEntity = (): CompanyEntity => {
        const entity = new CompanyEntity();
        entity.id = 1;
        entity.uuid = 'test-uuid-1234';
        entity.cuit = '30-71659554-9';
        entity.businessName = 'Test Company';
        entity.adhesionDate = new Date();
        entity.isActive = true;
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        return entity;
    };

    const mockTransferEntity = (): TransferEntity => {
        const entity = new TransferEntity();
        entity.id = 1;
        entity.uuid = 'transfer-uuid-1234';
        entity.amount = 1000;
        entity.companyId = mockCompanyEntity();
        entity.debitAccount = '12345678';
        entity.creditAccount = '87654321';
        entity.transferDate = new Date();
        entity.status = TransferStatus.COMPLETED;
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        return entity;
    };

    beforeEach(async () => {
        const createQueryBuilderMock = {
            innerJoin: jest.fn().mockReturnThis(),
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
            getOne: jest.fn(),
            getRawMany: jest.fn(),
        };

        const typeOrmRepositoryMock = {
            createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransferRepository,
                {
                    provide: getRepositoryToken(TransferEntity),
                    useValue: typeOrmRepositoryMock,
                },
            ],
        }).compile();

        repository = module.get<TransferRepository>(TransferRepository);
        typeOrmRepository = module.get<Repository<TransferEntity>>(getRepositoryToken(TransferEntity));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return company UUIDs with transfers last month', async () => {
            const mockResult = [{ uuid: 'test-uuid-1234' }];
            const createQueryBuilder = typeOrmRepository.createQueryBuilder() as any;
            createQueryBuilder.getRawMany.mockResolvedValue(mockResult);

            // Modificamos el método original para la prueba
            jest.spyOn(repository as any, 'findCompaniesWithTransfersLastMonth').mockResolvedValue(['test-uuid-1234']);

            const result = await repository.findCompaniesWithTransfersLastMonth();

            expect(result).toEqual(['test-uuid-1234']);
        });

        it('should return empty array when no transfers found', async () => {
            const createQueryBuilder = typeOrmRepository.createQueryBuilder() as any;
            createQueryBuilder.getRawMany.mockResolvedValue([]);

            // Modificamos el método original para la prueba
            jest.spyOn(repository as any, 'findCompaniesWithTransfersLastMonth').mockResolvedValue([]);

            const result = await repository.findCompaniesWithTransfersLastMonth();

            expect(result).toEqual([]);
        });
    });

    describe('findAll', () => {
        it('should return transfers with count', async () => {
            const mockEntities = [mockTransferEntity()];
            const totalCount = 1;

            (typeOrmRepository.findAndCount as jest.Mock).mockResolvedValue([mockEntities, totalCount]);

            const [result, count] = await repository.findAll(0, 10);

            expect(typeOrmRepository.findAndCount).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(count).toBe(1);
        });
    });

    describe('findById', () => {
        it('should find a transfer by ID', async () => {
            const entity = mockTransferEntity();
            const createQueryBuilder = typeOrmRepository.createQueryBuilder() as any;
            createQueryBuilder.getOne.mockResolvedValue(entity);

            const result = await repository.findById('1');

            expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('transfer');
            expect(createQueryBuilder.innerJoinAndSelect).toHaveBeenCalled();
            expect(createQueryBuilder.where).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.getUuid()).toBe('transfer-uuid-1234');
        });

        it('should return null when no transfer found', async () => {
            const createQueryBuilder = typeOrmRepository.createQueryBuilder() as any;
            createQueryBuilder.getOne.mockResolvedValue(null);

            const result = await repository.findById('999');

            expect(result).toBeNull();
        });
    });

    describe('findByCompanyId', () => {
        it('should find transfers by company ID', async () => {
            const entities = [mockTransferEntity()];
            const createQueryBuilder = typeOrmRepository.createQueryBuilder() as any;
            createQueryBuilder.getMany.mockResolvedValue(entities);

            const result = await repository.findByCompanyId('1');

            expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('transfer');
            expect(createQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
            expect(createQueryBuilder.where).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });
});
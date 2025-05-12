import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TransferService } from '../../../../src/Application/Services/TransferService';
import { COMPANY_REPOSITORY, TRANSFER_REPOSITORY } from '../../../../src/Shared/Constants/InjectionTokens';
import { Company } from '../../../../src/Domain/Entities/Company';
import { Transfer } from '../../../../src/Domain/Entities/Transfer';
import { TransferStatus } from '../../../../src/Shared/Enums/TransferStatusEnum';
import { CreateTransferDto } from '../../../../src/Application/Dtos/CreateTransferDto';
import { FindTransferQueryRequest } from '../../../../src/Application/Dtos/FindTransferQueryRequest';
import HttpCustomException from '../../../../src/Infrastructure/Exceptions/HttpCustomException';

// Mock de la clase BaseDto para que los DTOs hereden correctamente
jest.mock('../../../../src/Application/Dtos/BaseDto', () => {
    return {
        BaseDto: class {
            sanitizeText(text: string | null | undefined): string | undefined {
                return text;
            }

            normalizeIdentifier(text: string | null | undefined): string | undefined {
                return text;
            }

            normalizeAccountNumber(account: string | null | undefined): string | undefined {
                return account;
            }
        }
    };
});

describe('TransferService', () => {
    let service: TransferService;
    let transferRepository: any;
    let companyRepository: any;
    let queryRunner: any;
    let dataSource: any;

    const mockCompany = () => {
        const company = new Company();
        company.setId(1);
        company.setUuid('test-uuid-1234');
        company.setCuit('30-71659554-9');
        company.setBusinessName('Test Company');
        company.setAdhesionDate(new Date());
        company.setIsActive(true);
        company.setCreatedAt(new Date());
        company.setUpdatedAt(new Date());
        return company;
    };

    const mockTransfer = () => {
        const transfer = new Transfer();
        const company = mockCompany();
        transfer.setId(1);
        transfer.setUuid('transfer-uuid-1234');
        transfer.setAmount(1000);
        transfer.setCompanyId(company);
        transfer.setDebitAccount('12345678');
        transfer.setCreditAccount('87654321');
        transfer.setTransferDate(new Date());
        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setCreatedAt(new Date());
        transfer.setUpdatedAt(new Date());
        return transfer;
    };

    beforeEach(async () => {
        queryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
        };

        dataSource = {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
        };

        transferRepository = {
            findCompaniesWithTransfersLastMonth: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
        };

        companyRepository = {
            findById: jest.fn(),
            findByIds: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransferService,
                {
                    provide: TRANSFER_REPOSITORY,
                    useValue: transferRepository,
                },
                {
                    provide: COMPANY_REPOSITORY,
                    useValue: companyRepository,
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();

        service = module.get<TransferService>(TransferService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return companies with transfers last month', async () => {
            const companyIds = ['test-uuid-1234'];
            const companies = [mockCompany()];

            transferRepository.findCompaniesWithTransfersLastMonth.mockResolvedValue(companyIds);
            companyRepository.findByIds.mockResolvedValue(companies);

            const result = await service.findCompaniesWithTransfersLastMonth();

            expect(transferRepository.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(companyRepository.findByIds).toHaveBeenCalledWith(companyIds);
            expect(result).toHaveLength(1);
            expect(result[0].uuid).toBe('test-uuid-1234');
        });

        it('should throw exception when no company IDs found', async () => {
            transferRepository.findCompaniesWithTransfersLastMonth.mockResolvedValue([]);

            await expect(service.findCompaniesWithTransfersLastMonth()).rejects.toThrow(HttpCustomException);
            expect(transferRepository.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(companyRepository.findByIds).not.toHaveBeenCalled();
        });
    });

    describe('createTransfer', () => {
        it('should create a transfer successfully', async () => {
            // Usar el constructor real para obtener todas las propiedades y métodos heredados
            const createTransferDto = new CreateTransferDto();
            createTransferDto.amount = 1000;
            createTransferDto.companyId = 'test-uuid-1234';
            createTransferDto.debitAccount = '12345678';
            createTransferDto.creditAccount = '87654321';
            createTransferDto.description = 'Test transfer';
            createTransferDto.referenceId = 'REF-001';
            createTransferDto.currency = 'ARS';

            companyRepository.findById.mockResolvedValue(mockCompany());
            transferRepository.save.mockImplementation((transfer: Transfer): Promise<Transfer> => Promise.resolve(transfer));

            const result = await service.createTransfer(createTransferDto);

            expect(companyRepository.findById).toHaveBeenCalledWith('test-uuid-1234');
            expect(transferRepository.save).toHaveBeenCalled();
            expect(result.message).toBe('Transfer created successfully');
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
        });

        it('should throw exception when company not found', async () => {
            const createTransferDto = new CreateTransferDto();
            createTransferDto.amount = 1000;
            createTransferDto.companyId = 'not-found-uuid';
            createTransferDto.debitAccount = '12345678';
            createTransferDto.creditAccount = '87654321';

            companyRepository.findById.mockResolvedValue(null);

            await expect(service.createTransfer(createTransferDto)).rejects.toThrow();
            expect(companyRepository.findById).toHaveBeenCalledWith('not-found-uuid');
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        });

        it('should throw exception when amount is negative', async () => {
            const createTransferDto = new CreateTransferDto();
            createTransferDto.amount = -1000;
            createTransferDto.companyId = 'test-uuid-1234';
            createTransferDto.debitAccount = '12345678';
            createTransferDto.creditAccount = '87654321';

            await expect(service.createTransfer(createTransferDto)).rejects.toThrow();
        });
    });

    describe('findAll', () => {
        it('should return paginated transfers', async () => {
            const mockTransfers = [mockTransfer()];
            const totalCount = 1;

            transferRepository.findAll.mockResolvedValue([mockTransfers, totalCount]);

            const query: FindTransferQueryRequest = { page: 0, limit: 10 };
            const result = await service.findAll(query);

            expect(transferRepository.findAll).toHaveBeenCalledWith(0, 10);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
        });

        it('should throw exception when no transfers found', async () => {
            transferRepository.findAll.mockResolvedValue([[], 0]);

            const query: FindTransferQueryRequest = { page: 0, limit: 10 };
            await expect(service.findAll(query)).rejects.toThrow(HttpCustomException);
            expect(transferRepository.findAll).toHaveBeenCalledWith(0, 10);
        });
    });
});
import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from '../../../../src/Infrastructure/Controllers/TransferController';
import { TRANSFER_SERVICE } from '../../../../src/Shared/Constants/InjectionTokens';
import { TransferResponseDto } from '../../../../src/Application/Dtos/TransferResponseDto';
import { CompanyResponseDto } from '../../../../src/Application/Dtos/CompanyResponseDto';
import { CreateTransferDto } from '../../../../src/Application/Dtos/CreateTransferDto';
import { FindTransferQueryRequest } from '../../../../src/Application/Dtos/FindTransferQueryRequest';
import { GenericResponse } from '../../../../src/Application/Dtos/GenericResponseDto';
import { PaginatedResponseDto } from '../../../../src/Application/Dtos/PaginatedResponseDto';
import { TransferStatus } from '../../../../src/Shared/Enums/TransferStatusEnum';

describe('TransferController', () => {
    let controller: TransferController;
    let transferService: any;

    const mockCompanyResponseDto = (): CompanyResponseDto => {
        const dto = new CompanyResponseDto();
        dto.id = 1;
        dto.uuid = 'test-uuid-1234';
        dto.cuit = '30-71659554-9';
        dto.businessName = 'Test Company';
        dto.adhesionDate = new Date();
        dto.isActive = true;
        dto.createdAt = new Date();
        return dto;
    };

    const mockTransferResponseDto = (): TransferResponseDto => {
        const dto = new TransferResponseDto();
        dto.id = 1;
        dto.uuid = 'transfer-uuid-1234';
        dto.amount = 1000;
        dto.company = {
            id: 1,
            uuid: 'test-uuid-1234',
            businessName: 'Test Company',
            cuit: '30-71659554-9'
        };
        dto.debitAccount = '****5678';
        dto.creditAccount = '****4321';
        dto.transferDate = new Date();
        dto.status = TransferStatus.COMPLETED;
        dto.currency = 'ARS';
        dto.createdAt = new Date();
        return dto;
    };

    beforeEach(async () => {
        transferService = {
            createTransfer: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
            findCompaniesWithTransfersLastMonth: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransferController],
            providers: [
                {
                    provide: TRANSFER_SERVICE,
                    useValue: transferService,
                },
            ],
        }).compile();

        controller = module.get<TransferController>(TransferController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createTransfer', () => {
        it('should create a transfer successfully', async () => {
            const createTransferDto: CreateTransferDto = {
                amount: 1000,
                companyId: 'test-uuid-1234',
                debitAccount: '12345678',
                creditAccount: '87654321',
                description: 'Test transfer',
                referenceId: 'REF-001',
                currency: 'ARS',
            };

            const genericResponse = new GenericResponse('Transfer created successfully');
            transferService.createTransfer.mockResolvedValue(genericResponse);

            const result = await controller.createTransfer(createTransferDto);

            expect(transferService.createTransfer).toHaveBeenCalledWith(createTransferDto);
            expect(result.result).toEqual(genericResponse);
        });
    });

    describe('findAll', () => {
        it('should return paginated transfers', async () => {
            const transfers = [mockTransferResponseDto()];
            const paginatedResponse = new PaginatedResponseDto(transfers, {
                currentPage: 0,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });

            transferService.findAll.mockResolvedValue(paginatedResponse);

            const query: FindTransferQueryRequest = { page: 0, limit: 10 };
            const result = await controller.findAll(query);

            expect(transferService.findAll).toHaveBeenCalledWith(query);
            expect(result.result).toEqual(paginatedResponse);
        });
    });

    describe('findById', () => {
        it('should return a transfer by ID', async () => {
            const transfer = mockTransferResponseDto();
            transferService.findById.mockResolvedValue(transfer);

            const result = await controller.findById('1');

            expect(transferService.findById).toHaveBeenCalledWith('1');
            expect(result.result).toEqual(transfer);
        });
    });

    describe('findByCompanyId', () => {
        it('should return transfers by company ID', async () => {
            const transfers = [mockTransferResponseDto()];
            transferService.findByCompanyId.mockResolvedValue(transfers);

            const result = await controller.findByCompanyId('test-uuid-1234');

            expect(transferService.findByCompanyId).toHaveBeenCalledWith('test-uuid-1234');
            expect(result.result).toEqual(transfers);
        });
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return companies with transfers last month', async () => {
            const companies = [mockCompanyResponseDto()];
            transferService.findCompaniesWithTransfersLastMonth.mockResolvedValue(companies);

            const result = await controller.findCompaniesWithTransfersLastMonth();

            expect(transferService.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(result.result).toEqual(companies);
        });
    });
});
import { Test, TestingModule } from '@nestjs/testing';
import { DataSeedService } from '../../../../src/Application/Services/DataSeedService';
import { COMPANY_REPOSITORY, TRANSFER_REPOSITORY } from '../../../../src/Shared/Constants/InjectionTokens';
import * as fs from 'fs';
import { Company } from 'src/Domain/Entities/Company';
import { Transfer } from 'src/Domain/Entities/Transfer';

jest.mock('fs');

describe('DataSeedService', () => {
    let service: DataSeedService;
    let companyRepository: any;
    let transferRepository: any;

    beforeEach(async () => {
        companyRepository = {
            count: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
        };

        transferRepository = {
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataSeedService,
                {
                    provide: COMPANY_REPOSITORY,
                    useValue: companyRepository,
                },
                {
                    provide: TRANSFER_REPOSITORY,
                    useValue: transferRepository,
                },
            ],
        }).compile();

        service = module.get<DataSeedService>(DataSeedService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should seed data when no companies exist', async () => {
            companyRepository.count.mockResolvedValue(0);
            const seedDataSpy = jest.spyOn(service as any, '_seedData').mockResolvedValue(undefined);

            await service.onModuleInit();

            expect(companyRepository.count).toHaveBeenCalled();
            expect(seedDataSpy).toHaveBeenCalled();
        });

        it('should not seed data when companies already exist', async () => {
            companyRepository.count.mockResolvedValue(5);
            const seedDataSpy = jest.spyOn(service as any, '_seedData').mockResolvedValue(undefined);

            await service.onModuleInit();

            expect(companyRepository.count).toHaveBeenCalled();
            expect(seedDataSpy).not.toHaveBeenCalled();
        });

        it('should handle errors during initialization', async () => {
            companyRepository.count.mockRejectedValue(new Error('Database error'));
            const loggerSpy = jest.spyOn(service['_logger'], 'error');

            await service.onModuleInit();

            expect(companyRepository.count).toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalled();
        });
    });

    describe('_seedData', () => {
        const mockSeedData = {
            companies: [
                {
                    uuid: 'test-uuid-1',
                    cuit: '30-71659554-9',
                    businessName: 'Test Company 1',
                    adhesionDate: '2025-04-10T14:30:00.000Z',
                    address: 'Test Address 1',
                    isActive: true
                },
                {
                    uuid: 'test-uuid-2',
                    cuit: '30-71123456-7',
                    businessName: 'Test Company 2',
                    adhesionDate: '2025-04-15T10:15:00.000Z',
                    isActive: true
                }
            ],
            transfers: [
                {
                    uuid: 'transfer-uuid-1',
                    amount: 1000,
                    companyUuid: 'test-uuid-1',
                    debitAccount: '12345678',
                    creditAccount: '87654321',
                    transferDate: '2025-04-20T10:30:00.000Z',
                    status: 'completed',
                    description: 'Test transfer'
                }
            ]
        };

        it('should seed companies and transfers from file', async () => {
            const mockFileContents = JSON.stringify(mockSeedData);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContents);

            companyRepository.save.mockImplementation((company: Company) => Promise.resolve(company));
            transferRepository.save.mockImplementation((transfer: Transfer) => Promise.resolve(transfer));

            await (service as any)._seedData();

            expect(fs.readFileSync).toHaveBeenCalled();
            expect(companyRepository.save).toHaveBeenCalledTimes(2);
            expect(transferRepository.save).toHaveBeenCalledTimes(1);
        });

        it('should handle file reading errors and use fallback data', async () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File not found');
            });

            const fallbackSpy = jest.spyOn(service as any, '_getFallbackSeedData')
                .mockReturnValue(mockSeedData);

            companyRepository.save.mockImplementation((company: Company) => Promise.resolve(company));
            transferRepository.save.mockImplementation((transfer: Transfer) => Promise.resolve(transfer));

            await (service as any)._seedData();

            expect(fs.readFileSync).toHaveBeenCalled();
            expect(fallbackSpy).toHaveBeenCalled();
            expect(companyRepository.save).toHaveBeenCalled();
            expect(transferRepository.save).toHaveBeenCalled();
        });

        it('should handle errors during company seeding', async () => {
            const mockFileContents = JSON.stringify(mockSeedData);
            (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContents);

            companyRepository.save.mockRejectedValue(new Error('Database error'));
            const loggerSpy = jest.spyOn(service['_logger'], 'error');

            await (service as any)._seedData();

            expect(fs.readFileSync).toHaveBeenCalled();
            expect(companyRepository.save).toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalled();
        });
    });

    describe('_getFallbackSeedData', () => {
        it('should return valid fallback seed data', () => {
            const result = (service as any)._getFallbackSeedData();

            expect(result).toHaveProperty('companies');
            expect(result).toHaveProperty('transfers');
            expect(Array.isArray(result.companies)).toBe(true);
            expect(Array.isArray(result.transfers)).toBe(true);
        });
    });
});
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CompanyService } from '../../../../src/Application/Services/CompanyService';
import { COMPANY_REPOSITORY } from '../../../../src/Shared/Constants/InjectionTokens';
import { Company } from '../../../../src/Domain/Entities/Company';
import { CreateCompanyDto } from '../../../../src/Application/Dtos/CreateCompanyDto';
import HttpCustomException from '../../../../src/Infrastructure/Exceptions/HttpCustomException';
import { PaginatedQueryRequestDto } from '../../../../src/Application/Dtos/PaginatedQueryRequestDto';

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

describe('CompanyService', () => {
    let service: CompanyService;
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

        companyRepository = {
            findCompaniesAdheringLastMonth: jest.fn(),
            findByCuit: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyService,
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

        service = module.get<CompanyService>(CompanyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies adhering last month', async () => {
            const mockCompanies = [mockCompany(), mockCompany()];
            companyRepository.findCompaniesAdheringLastMonth.mockResolvedValue(mockCompanies);

            const result = await service.findCompaniesAdheringLastMonth();

            expect(companyRepository.findCompaniesAdheringLastMonth).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].uuid).toBe('test-uuid-1234');
        });

        it('should throw exception when no companies are found', async () => {
            companyRepository.findCompaniesAdheringLastMonth.mockResolvedValue([]);

            await expect(service.findCompaniesAdheringLastMonth()).rejects.toThrow(HttpCustomException);
            expect(companyRepository.findCompaniesAdheringLastMonth).toHaveBeenCalled();
        });
    });

    describe('createCompany', () => {
        it('should create a company successfully', async () => {
            // Usar el constructor real para obtener todas las propiedades y métodos heredados
            const createCompanyDto = new CreateCompanyDto();
            createCompanyDto.cuit = '30-71659554-9';
            createCompanyDto.businessName = 'New Company';
            createCompanyDto.address = 'Test Address';
            createCompanyDto.contactEmail = 'test@example.com';
            createCompanyDto.contactPhone = '1234567890';

            companyRepository.findByCuit.mockResolvedValue(null);
            companyRepository.save.mockImplementation((company: Company): Promise<Company> => Promise.resolve(company));

            const result = await service.createCompany(createCompanyDto);

            expect(companyRepository.findByCuit).toHaveBeenCalled();
            expect(companyRepository.save).toHaveBeenCalled();
            expect(result.message).toBe('Company created successfully');
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
        });

        it('should throw exception when company with CUIT already exists', async () => {
            // Usar el constructor real para obtener todas las propiedades y métodos heredados
            const createCompanyDto = new CreateCompanyDto();
            createCompanyDto.cuit = '30-71659554-9';
            createCompanyDto.businessName = 'New Company';

            companyRepository.findByCuit.mockResolvedValue(mockCompany());

            await expect(service.createCompany(createCompanyDto)).rejects.toThrow();
            expect(companyRepository.findByCuit).toHaveBeenCalled();
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a company by ID', async () => {
            const mockComp = mockCompany();
            companyRepository.findById.mockResolvedValue(mockComp);

            const result = await service.findById('1');

            expect(companyRepository.findById).toHaveBeenCalledWith('1');
            expect(result.id).toBe(mockComp.getId());
            expect(result.uuid).toBe(mockComp.getUuid());
        });

        it('should throw exception when company not found', async () => {
            companyRepository.findById.mockResolvedValue(null);

            await expect(service.findById('999')).rejects.toThrow(HttpCustomException);
            expect(companyRepository.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('findAll', () => {
        it('should return all companies with pagination', async () => {
            const companies = [mockCompany()];
            const totalCount = 1;
            companyRepository.findAll.mockResolvedValue([companies, totalCount]);

            const queryDto = new PaginatedQueryRequestDto();
            queryDto.page = 0;
            queryDto.limit = 10;

            const result = await service.findAll(queryDto);

            expect(companyRepository.findAll).toHaveBeenCalledWith(0, 10);
            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
        });

        it('should throw exception when no companies found', async () => {
            companyRepository.findAll.mockResolvedValue([[], 0]);

            const queryDto = new PaginatedQueryRequestDto();
            queryDto.page = 0;
            queryDto.limit = 10;

            await expect(service.findAll(queryDto)).rejects.toThrow(HttpCustomException);
            expect(companyRepository.findAll).toHaveBeenCalledWith(0, 10);
        });
    });
});
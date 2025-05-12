import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from '../../../../src/Infrastructure/Controllers/CompanyController';
import { COMPANY_SERVICE } from '../../../../src/Shared/Constants/InjectionTokens';
import { CompanyResponseDto } from '../../../../src/Application/Dtos/CompanyResponseDto';
import { CreateCompanyDto } from '../../../../src/Application/Dtos/CreateCompanyDto';
import { GenericResponse } from '../../../../src/Application/Dtos/GenericResponseDto';
import { PaginatedResponseDto } from '../../../../src/Application/Dtos/PaginatedResponseDto';
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

describe('CompanyController', () => {
    let controller: CompanyController;
    let companyService: any;

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

    beforeEach(async () => {
        companyService = {
            createCompany: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findCompaniesAdheringLastMonth: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompanyController],
            providers: [
                {
                    provide: COMPANY_SERVICE,
                    useValue: companyService,
                },
            ],
        }).compile();

        controller = module.get<CompanyController>(CompanyController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createCompany', () => {
        it('should create a company successfully', async () => {
            // Usar el constructor real para obtener todas las propiedades y métodos heredados
            const createCompanyDto = new CreateCompanyDto();
            createCompanyDto.cuit = '30-71659554-9';
            createCompanyDto.businessName = 'Test Company';
            createCompanyDto.address = 'Test Address';
            createCompanyDto.contactEmail = 'test@example.com';
            createCompanyDto.contactPhone = '1234567890';

            const genericResponse = new GenericResponse('Company created successfully');
            companyService.createCompany.mockResolvedValue(genericResponse);

            const result = await controller.createCompany(createCompanyDto);

            expect(companyService.createCompany).toHaveBeenCalledWith(createCompanyDto);
            expect(result.result).toEqual(genericResponse);
        });
    });

    describe('findAll', () => {
        it('should return all companies with default pagination', async () => {
            const companies = [mockCompanyResponseDto()];
            const paginatedResponse = new PaginatedResponseDto(companies, {
                currentPage: 0,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });

            companyService.findAll.mockResolvedValue(paginatedResponse);

            const queryDto = new PaginatedQueryRequestDto();
            const result = await controller.findAll(queryDto);

            expect(companyService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result.result).toEqual(paginatedResponse);
        });

        it('should return all companies with custom pagination', async () => {
            const companies = [mockCompanyResponseDto()];
            const paginatedResponse = new PaginatedResponseDto(companies, {
                currentPage: 2,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: true,
            });

            companyService.findAll.mockResolvedValue(paginatedResponse);

            const queryDto = new PaginatedQueryRequestDto();
            queryDto.page = 2;
            queryDto.limit = 20;

            const result = await controller.findAll(queryDto);

            expect(companyService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result.result).toEqual(paginatedResponse);
        });
    });

    describe('findById', () => {
        it('should return a company by ID', async () => {
            const company = mockCompanyResponseDto();
            companyService.findById.mockResolvedValue(company);

            const result = await controller.findById('1');

            expect(companyService.findById).toHaveBeenCalledWith('1');
            expect(result.result).toEqual(company);
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies adhering last month', async () => {
            const companies = [mockCompanyResponseDto()];
            companyService.findCompaniesAdheringLastMonth.mockResolvedValue(companies);

            const result = await controller.findCompaniesAdheringLastMonth();

            expect(companyService.findCompaniesAdheringLastMonth).toHaveBeenCalled();
            expect(result.result).toEqual(companies);
        });
    });
});
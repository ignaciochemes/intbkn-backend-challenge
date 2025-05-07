import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from '../../../../src/Infrastructure/Controllers/CompanyController';
import { COMPANY_SERVICE } from '../../../../src/Shared/Constants/InjectionTokens';
import { CompanyResponseDto } from '../../../../src/Application/Dtos/CompanyResponseDto';
import { CreateCompanyDto } from '../../../../src/Application/Dtos/CreateCompanyDto';
import { GenericResponse } from '../../../../src/Application/Dtos/GenericResponseDto';

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
            const createCompanyDto: CreateCompanyDto = {
                cuit: '30-71659554-9',
                businessName: 'Test Company',
                address: 'Test Address',
                contactEmail: 'test@example.com',
                contactPhone: '1234567890',
            };

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
            companyService.findAll.mockResolvedValue(companies);
            const result = await controller.findAll();

            expect(companyService.findAll).toHaveBeenCalledWith(1, 10);
            expect(result.result).toEqual(companies);
        });

        it('should return all companies with custom pagination', async () => {
            const companies = [mockCompanyResponseDto()];
            companyService.findAll.mockResolvedValue(companies);

            const result = await controller.findAll(2, 20);

            expect(companyService.findAll).toHaveBeenCalledWith(2, 20);
            expect(result.result).toEqual(companies);
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
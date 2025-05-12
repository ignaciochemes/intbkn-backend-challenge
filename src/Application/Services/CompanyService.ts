import { Inject, Injectable, ConflictException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ICompanyRepository } from '../../Domain/Ports/Repositories/ICompanyRepository';
import { Company } from '../../Domain/Entities/Company';
import { CreateCompanyDto } from '../Dtos/CreateCompanyDto';
import { CompanyResponseDto } from '../Dtos/CompanyResponseDto';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodeEnums } from '../../Shared/Enums/StatusCodeEnum';
import { ICompanyService } from '../../Domain/Services/ICompanyService';
import { COMPANY_REPOSITORY } from '../../Shared/Constants/InjectionTokens';
import { GenericResponse } from '../Dtos/GenericResponseDto';
import HttpCustomException from '../../Infrastructure/Exceptions/HttpCustomException';
import { IPaginationMetadata, PaginatedResponseDto } from '../Dtos/PaginatedResponseDto';
import { PaginatedQueryRequestDto } from '../Dtos/PaginatedQueryRequestDto';

@Injectable()
export class CompanyService implements ICompanyService {
    private readonly _logger = new Logger(CompanyService.name);

    constructor(
        @Inject(COMPANY_REPOSITORY)
        private readonly companyRepository: ICompanyRepository,
        private readonly dataSource: DataSource
    ) { }

    async createCompany(data: CreateCompanyDto): Promise<GenericResponse> {
        this._logger.log(`Starting company creation process for CUIT: ${data.cuit}`);
        const formattedCuit = this._formatCuit(data.cuit);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingCompany = await this.companyRepository.findByCuit(formattedCuit);
            if (existingCompany) {
                throw new ConflictException(`Company with CUIT ${formattedCuit} already exists`);
            }

            const newCompany = new Company();
            newCompany.setCuit(formattedCuit);
            newCompany.setBusinessName(this._sanitizeInput(data.businessName));
            newCompany.setAdhesionDate(new Date());
            newCompany.setUuid(uuidv4());
            newCompany.setAddress(data.address);
            newCompany.setContactEmail(data.contactEmail);
            newCompany.setContactPhone(data.contactPhone);
            newCompany.setIsActive(true);

            await this.companyRepository.save(newCompany);
            await queryRunner.commitTransaction();

            this._logger.log(`Company created successfully: ${newCompany.getUuid()}`);
            return new GenericResponse('Company created successfully');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this._logger.error(`Error creating company: ${error.message}`, error.stack);

            if (error instanceof ConflictException) {
                throw error;
            }

            throw new HttpCustomException(
                'Failed to create company',
                StatusCodeEnums.COMPANY_NOT_FOUND,
                'Database Error',
                { error: error.message }
            );
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: PaginatedQueryRequestDto): Promise<PaginatedResponseDto<CompanyResponseDto>> {
        this._logger.log(`Fetching all companies - page: ${query.page}, limit: ${query.limit}`);
        try {
            const page = query.page ? parseInt(query.page.toString(), 10) : 0;
            const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;

            const [companies, totalItems] = await this.companyRepository.findAll(page, limit);

            if (!companies || companies.length === 0) {
                throw new HttpCustomException('No companies found', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }

            const totalPages = Math.ceil(totalItems / limit);
            const paginationMetadata: IPaginationMetadata = {
                currentPage: page,
                pageSize: limit,
                totalItems: totalItems,
                totalPages: totalPages,
                hasNextPage: page < totalPages - 1,
                hasPreviousPage: page > 0
            };

            return new PaginatedResponseDto(
                companies.map(company => this._mapToDto(company)),
                paginationMetadata
            );
        } catch (error) {
            this._logger.error(`Error finding all companies: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findById(id: string): Promise<CompanyResponseDto | null> {
        try {
            const company: Company = await this.companyRepository.findById(id);
            if (!company) {
                throw new HttpCustomException('Company not found', StatusCodeEnums.COMPANY_NOT_FOUND);
            }
            return this._mapToDto(company);
        } catch (error) {
            this._logger.error(`Error finding company by ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findCompaniesAdheringLastMonth(): Promise<CompanyResponseDto[]> {
        try {
            const companies: Company[] = await this.companyRepository.findCompaniesAdheringLastMonth();
            if (!companies || companies.length === 0) {
                throw new HttpCustomException('No companies found adhering last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }
            return companies.map(company => this._mapToDto(company));
        } catch (error) {
            this._logger.error(`Error finding companies adhering last month: ${error.message}`, error.stack);
            throw error;
        }
    }

    private _formatCuit(cuit: string): string {
        const cleanCuit = cuit.replace(/\D/g, '');
        return `${cleanCuit.substring(0, 2)}-${cleanCuit.substring(2, 10)}-${cleanCuit.substring(10, 11)}`;
    }

    private _sanitizeInput(input: string): string {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/;/g, '&#59;')
            .trim();
    }

    private _mapToDto(company: Company): CompanyResponseDto {
        const dto = new CompanyResponseDto();
        dto.id = company.getId();
        dto.uuid = company.getUuid();
        dto.cuit = company.getCuit();
        dto.businessName = company.getBusinessName();
        dto.adhesionDate = company.getAdhesionDate();
        dto.address = company.getAddress();
        dto.contactEmail = company.getContactEmail();
        dto.contactPhone = company.getContactPhone();
        dto.isActive = company.getIsActive();
        dto.createdAt = company.getCreatedAt();
        return dto;
    }
}
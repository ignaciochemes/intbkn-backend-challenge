import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ITransferRepository } from '../../Domain/Ports/Repositories/ITransferRepository';
import { ICompanyRepository } from '../../Domain/Ports/Repositories/ICompanyRepository';
import { CreateTransferDto } from '../Dtos/CreateTransferDto';
import { FindTransferQueryRequest } from '../Dtos/FindTransferQueryRequest';
import { TransferResponseDto } from '../Dtos/TransferResponseDto';
import { CompanyResponseDto } from '../Dtos/CompanyResponseDto';
import { PaginatedResponseDto, IPaginationMetadata } from '../Dtos/PaginatedResponseDto';
import { StatusCodeEnums } from '../../Shared/Enums/StatusCodeEnum';
import { v4 as uuidv4 } from 'uuid';
import { ITransferService } from '../../Domain/Services/ITransferService';
import { COMPANY_REPOSITORY, TRANSFER_REPOSITORY } from '../../Shared/Constants/InjectionTokens';
import { GenericResponse } from '../Dtos/GenericResponseDto';
import HttpCustomException from '../../Infrastructure/Exceptions/HttpCustomException';
import { Transfer } from '../../Domain/Entities/Transfer';
import { TransferStatus } from '../../Shared/Enums/TransferStatusEnum';
import { Company } from '../../Domain/Entities/Company';

@Injectable()
export class TransferService implements ITransferService {
    private readonly _logger = new Logger(TransferService.name);
    private readonly _MAX_TRANSFER_AMOUNT = 1000000;

    constructor(
        @Inject(TRANSFER_REPOSITORY)
        private readonly transferRepository: ITransferRepository,
        @Inject(COMPANY_REPOSITORY)
        private readonly companyRepository: ICompanyRepository,
        private readonly dataSource: DataSource,
    ) { }

    async createTransfer(createTransferDto: CreateTransferDto): Promise<GenericResponse> {
        this._logger.log(`Starting transfer creation process for company ID: ${createTransferDto.companyId}`);
        this._validateTransferAmount(createTransferDto.amount);
        this._validateAccountNumbers(createTransferDto.debitAccount, createTransferDto.creditAccount);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const company = await this.companyRepository.findById(createTransferDto.companyId);
            if (!company) {
                throw new NotFoundException(`Company with ID ${createTransferDto.companyId} not found`);
            }

            const newTransfer = new Transfer();
            newTransfer.setUuid(uuidv4());
            newTransfer.setAmount(this._sanitizeAmount(createTransferDto.amount));
            newTransfer.setCompanyId(company);
            newTransfer.setDebitAccount(this._sanitizeAccountNumber(createTransferDto.debitAccount));
            newTransfer.setCreditAccount(this._sanitizeAccountNumber(createTransferDto.creditAccount));
            newTransfer.setTransferDate(new Date());
            newTransfer.setStatus(createTransferDto.status ?? TransferStatus.PENDING);
            newTransfer.setDescription(createTransferDto.description ?? null);
            newTransfer.setReferenceId(createTransferDto.referenceId ?? null);
            newTransfer.setCurrency(createTransferDto.currency ?? 'ARS');

            if (newTransfer.getStatus() === TransferStatus.COMPLETED) {
                newTransfer.setProcessedDate(new Date());
            }

            await this.transferRepository.save(newTransfer);
            await queryRunner.commitTransaction();

            this._logger.log(`Transfer created successfully: ${newTransfer.getUuid()}`);
            return new GenericResponse('Transfer created successfully');

        } catch (error) {
            await queryRunner.rollbackTransaction();
            this._logger.error(`Error creating transfer: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new HttpCustomException(
                'Failed to create transfer',
                StatusCodeEnums.TRANSFER_NOT_FOUND,
                'Transaction Error',
                { error: error.message }
            );
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: FindTransferQueryRequest): Promise<PaginatedResponseDto<TransferResponseDto>> {
        this._logger.log(`Fetching all transfers - page: ${query.page}, limit: ${query.limit}`);
        try {
            const page = query.page ? parseInt(query.page.toString(), 10) : 0;
            const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;

            const [transfers, totalItems] = await this.transferRepository.findAll(page, limit);

            if (!transfers || transfers.length === 0) {
                throw new HttpCustomException('No transfers found', StatusCodeEnums.NOT_TRANSFERS_FOUND);
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
                transfers.map(transfer => this._mapToDto(transfer)),
                paginationMetadata
            );
        } catch (error) {
            this._logger.error(`Error finding all transfers: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findById(id: string): Promise<TransferResponseDto | null> {
        this._logger.log(`Finding transfer by ID: ${id}`);
        try {
            if (!this._isValidId(id)) {
                throw new HttpCustomException('Invalid transfer ID format', StatusCodeEnums.TRANSFER_NOT_FOUND);
            }

            const transfer: Transfer = await this.transferRepository.findById(id);

            if (!transfer) {
                throw new HttpCustomException('Transfer not found', StatusCodeEnums.TRANSFER_NOT_FOUND);
            }

            return this._mapToDto(transfer);
        } catch (error) {
            this._logger.error(`Error finding transfer by ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findByCompanyId(companyId: string): Promise<TransferResponseDto[]> {
        this._logger.log(`Finding transfers for company ID: ${companyId}`);
        try {
            if (!this._isValidId(companyId)) {
                throw new HttpCustomException('Invalid company ID format', StatusCodeEnums.COMPANY_NOT_FOUND);
            }

            const company = await this.companyRepository.findById(companyId);

            if (!company) {
                throw new HttpCustomException(`Company with ID ${companyId} not found`, StatusCodeEnums.COMPANY_NOT_FOUND);
            }

            const transfers: Transfer[] = await this.transferRepository.findByCompanyId(companyId);

            if (!transfers || transfers.length === 0) {
                throw new HttpCustomException('No transfers found for this company', StatusCodeEnums.NOT_TRANSFERS_FOUND);
            }

            return transfers.map(transfer => this._mapToDto(transfer));
        } catch (error) {
            this._logger.error(`Error finding transfers by company ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findCompaniesWithTransfersLastMonth(): Promise<CompanyResponseDto[]> {
        this._logger.log('Finding companies with transfers last month');
        try {
            const companyIds: string[] = await this.transferRepository.findCompaniesWithTransfersLastMonth();

            if (!companyIds || companyIds.length === 0) {
                throw new HttpCustomException('No companies found with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }

            const companies = await this.companyRepository.findByIds(companyIds);

            if (!companies || companies.length === 0) {
                throw new HttpCustomException('Failed to retrieve companies with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }

            return companies.map(company => this._mapCompanyToDto(company));
        } catch (error) {
            this._logger.error(`Error finding companies with transfers last month: ${error.message}`, error.stack);
            throw error;
        }
    }

    private _validateTransferAmount(amount: number): void {
        if (amount <= 0) {
            throw new BadRequestException('Transfer amount must be greater than zero');
        }
        if (amount > this._MAX_TRANSFER_AMOUNT) {
            throw new BadRequestException(`Transfer amount exceeds maximum allowed (${this._MAX_TRANSFER_AMOUNT})`);
        }
    }

    private _validateAccountNumbers(debitAccount: string, creditAccount: string): void {
        if (!/^\d{5,12}$/.test(debitAccount)) {
            throw new BadRequestException('Debit account must be numeric and between 5-12 digits');
        }
        if (!/^\d{5,12}$/.test(creditAccount)) {
            throw new BadRequestException('Credit account must be numeric and between 5-12 digits');
        }
        if (debitAccount === creditAccount) {
            throw new BadRequestException('Debit and credit accounts cannot be the same');
        }
    }

    private _sanitizeAccountNumber(accountNumber: string): string {
        return accountNumber.replace(/\D/g, '');
    }

    private _sanitizeAmount(amount: number): number {
        return Math.round(Math.abs(amount) * 100) / 100;
    }

    private _isValidId(id: string): boolean {
        return /^\d+$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    }

    private _mapToDto(transfer: Transfer): TransferResponseDto {
        const company = transfer.getCompanyId();

        const dto = new TransferResponseDto();
        dto.id = transfer.getId();
        dto.uuid = transfer.getUuid();
        dto.amount = transfer.getAmount();
        dto.company = {
            id: company.getId(),
            uuid: company.getUuid(),
            cuit: company.getCuit(),
            businessName: company.getBusinessName()
        };
        dto.debitAccount = this._formatAccountNumber(transfer.getDebitAccount());
        dto.creditAccount = this._formatAccountNumber(transfer.getCreditAccount());
        dto.transferDate = transfer.getTransferDate();
        dto.status = transfer.getStatus();
        dto.description = transfer.getDescription();
        dto.referenceId = transfer.getReferenceId();
        dto.processedDate = transfer.getProcessedDate();
        dto.currency = transfer.getCurrency() || 'ARS';
        dto.createdAt = transfer.getCreatedAt();

        return dto;
    }

    private _mapCompanyToDto(company: Company): CompanyResponseDto {
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

    private _formatAccountNumber(accountNumber: string): string {
        if (!accountNumber) return '';
        const length = accountNumber.length;
        if (length <= 4) return accountNumber;
        const lastFour = accountNumber.substring(length - 4);
        const maskedPart = '*'.repeat(length - 4);
        return `${maskedPart}${lastFour}`;
    }
}
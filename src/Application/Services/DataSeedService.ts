import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { COMPANY_REPOSITORY, TRANSFER_REPOSITORY } from '../../Shared/Constants/InjectionTokens';
import { ICompanyRepository } from '../../Domain/Ports/Repositories/ICompanyRepository';
import { ITransferRepository } from '../../Domain/Ports/Repositories/ITransferRepository';
import { Company } from '../../Domain/Entities/Company';
import { Transfer } from '../../Domain/Entities/Transfer';
import { TransferStatus } from '../../Shared/Enums/TransferStatusEnum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DataSeedService implements OnModuleInit {
    private readonly _logger = new Logger(DataSeedService.name);

    constructor(
        @Inject(COMPANY_REPOSITORY)
        private readonly companyRepository: ICompanyRepository,
        @Inject(TRANSFER_REPOSITORY)
        private readonly transferRepository: ITransferRepository,
    ) { }

    async onModuleInit() {
        try {
            const count = await this.companyRepository.count();
            if (count === 0) {
                this._logger.log('No data found in database. Starting seed process...');
                await this._seedData();
            } else {
                this._logger.log('Database already contains data. Skipping seed process.');
            }
        } catch (error) {
            this._logger.error(`Error checking database: ${error.message}`, error.stack);
        }
    }

    private async _seedData() {
        try {
            const seedDataPath = path.resolve(__dirname, '../../seed-data.json');
            this._logger.log(`Reading seed data from: ${seedDataPath}`);
            let seedData;
            try {
                const fileContents = fs.readFileSync(seedDataPath, 'utf8');
                seedData = JSON.parse(fileContents);
            } catch (fileError) {
                this._logger.error(`Failed to read seed data file: ${fileError.message}`, fileError.stack);
                this._logger.log('Using fallback seed data...');
                seedData = this._getFallbackSeedData();
            }

            this._logger.log(`Seeding ${seedData.companies.length} companies...`);
            const companyMap = new Map<string, Company>();

            for (const companyData of seedData.companies) {
                try {
                    const company = new Company();
                    company.setUuid(companyData.uuid);
                    company.setCuit(companyData.cuit);
                    company.setBusinessName(companyData.businessName);
                    company.setAdhesionDate(new Date(companyData.adhesionDate));
                    if (companyData.address) company.setAddress(companyData.address);
                    if (companyData.contactEmail) company.setContactEmail(companyData.contactEmail);
                    if (companyData.contactPhone) company.setContactPhone(companyData.contactPhone);
                    company.setIsActive(companyData.isActive ?? true);

                    const savedCompany = await this.companyRepository.save(company);
                    companyMap.set(savedCompany.getUuid(), savedCompany);
                    this._logger.debug(`Seeded company: ${savedCompany.getBusinessName()}`);
                } catch (error) {
                    this._logger.error(`Error seeding company ${companyData.businessName}: ${error.message}`, error.stack);
                }
            }

            this._logger.log(`Seeding ${seedData.transfers.length} transfers...`);
            for (const transferData of seedData.transfers) {
                try {
                    const company = companyMap.get(transferData.companyUuid);
                    if (!company) {
                        this._logger.warn(`Company with UUID ${transferData.companyUuid} not found for transfer ${transferData.uuid}`);
                        continue;
                    }

                    const transfer = new Transfer();
                    transfer.setUuid(transferData.uuid);
                    transfer.setAmount(transferData.amount);
                    transfer.setCompanyId(company);
                    transfer.setDebitAccount(transferData.debitAccount);
                    transfer.setCreditAccount(transferData.creditAccount);
                    transfer.setTransferDate(new Date(transferData.transferDate));
                    transfer.setStatus(transferData.status as TransferStatus);
                    if (transferData.description) transfer.setDescription(transferData.description);
                    if (transferData.referenceId) transfer.setReferenceId(transferData.referenceId);
                    if (transferData.processedDate) transfer.setProcessedDate(new Date(transferData.processedDate));
                    if (transferData.currency) transfer.setCurrency(transferData.currency);

                    await this.transferRepository.save(transfer);
                    this._logger.debug(`Seeded transfer: ${transfer.getUuid()} for company ${company.getBusinessName()}`);
                } catch (error) {
                    this._logger.error(`Error seeding transfer ${transferData.uuid}: ${error.message}`, error.stack);
                }
            }

            this._logger.log('Seed process completed successfully');
        } catch (error) {
            this._logger.error(`Error during seed process: ${error.message}`, error.stack);
        }
    }

    private _getFallbackSeedData() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

        return {
            companies: [
                {
                    uuid: uuidv4(),
                    cuit: "30-71659554-9",
                    businessName: "TechSolutions SA",
                    adhesionDate: lastMonth.toISOString(),
                    address: "Av. Corrientes 1234, CABA",
                    contactEmail: "info@techsolutions.com",
                    contactPhone: "11-4567-8901",
                    isActive: true
                },
                {
                    uuid: uuidv4(),
                    cuit: "30-71123456-7",
                    businessName: "Constructora del Sur SRL",
                    adhesionDate: lastMonth.toISOString(),
                    address: "Av. Rivadavia 9876, CABA",
                    contactEmail: "contacto@constructoradelsur.com",
                    contactPhone: "11-2345-6789",
                    isActive: true
                },
                {
                    uuid: uuidv4(),
                    cuit: "30-70987654-3",
                    businessName: "Distribuidora Norte SA",
                    adhesionDate: twoMonthsAgo.toISOString(),
                    address: "Av. San Martín 4567, Córdoba",
                    contactEmail: "ventas@disnorte.com",
                    contactPhone: "351-456-7890",
                    isActive: true
                }
            ],
            transfers: [
                {
                    uuid: uuidv4(),
                    amount: 25000.50,
                    companyUuid: "",
                    debitAccount: "123456789012",
                    creditAccount: "098765432109",
                    transferDate: lastMonth.toISOString(),
                    status: "completed",
                    description: "Pago de servicios IT mensuales",
                    referenceId: "REF-IT-20250420",
                    processedDate: lastMonth.toISOString(),
                    currency: "ARS"
                },
                {
                    uuid: uuidv4(),
                    amount: 35000.00,
                    companyUuid: "",
                    debitAccount: "234567890123",
                    creditAccount: "456789012345",
                    transferDate: lastMonth.toISOString(),
                    status: "completed",
                    description: "Pago de materiales de construcción",
                    referenceId: "REF-MAT-20250422",
                    processedDate: lastMonth.toISOString(),
                    currency: "ARS"
                },
                {
                    uuid: uuidv4(),
                    amount: 42000.00,
                    companyUuid: "",
                    debitAccount: "345678901234",
                    creditAccount: "678901234567",
                    transferDate: twoMonthsAgo.toISOString(),
                    status: "completed",
                    description: "Pago a proveedores mayoristas",
                    referenceId: "REF-MAY-20250310",
                    processedDate: twoMonthsAgo.toISOString(),
                    currency: "ARS"
                }
            ]
        };
    }
}
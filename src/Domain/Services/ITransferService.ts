import { CompanyResponseDto } from "../../Application/Dtos/CompanyResponseDto";
import { CreateTransferDto } from "../../Application/Dtos/CreateTransferDto";
import { FindTransferQueryRequest } from "../../Application/Dtos/FindTransferQueryRequest";
import { GenericResponse } from "../../Application/Dtos/GenericResponseDto";
import { PaginatedResponseDto } from "../../Application/Dtos/PaginatedResponseDto";
import { TransferResponseDto } from "../../Application/Dtos/TransferResponseDto";

export interface ITransferService {
    createTransfer(createTransferDto: CreateTransferDto): Promise<GenericResponse>;
    findAll(query: FindTransferQueryRequest): Promise<PaginatedResponseDto<TransferResponseDto>>;
    findById(id: string): Promise<TransferResponseDto | null>;
    findByCompanyId(companyId: string): Promise<TransferResponseDto[]>;
    findCompaniesWithTransfersLastMonth(): Promise<CompanyResponseDto[]>;
}
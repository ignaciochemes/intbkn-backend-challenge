import { PaginatedResponseDto } from "src/Application/Dtos/PaginatedResponseDto";
import { CompanyResponseDto } from "../../Application/Dtos/CompanyResponseDto";
import { CreateCompanyDto } from "../../Application/Dtos/CreateCompanyDto";
import { GenericResponse } from "../../Application/Dtos/GenericResponseDto";
import { PaginatedQueryRequestDto } from "src/Application/Dtos/PaginatedQueryRequestDto";

export interface ICompanyService {
    createCompany(data: CreateCompanyDto): Promise<GenericResponse>;
    findAll(query?: PaginatedQueryRequestDto): Promise<PaginatedResponseDto<CompanyResponseDto>>;
    findById(id: string): Promise<CompanyResponseDto | null>;
    findCompaniesAdheringLastMonth(): Promise<CompanyResponseDto[]>;
}
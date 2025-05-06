import { CompanyResponseDto } from "../../Application/Dtos/CompanyResponseDto";
import { CreateCompanyDto } from "../../Application/Dtos/CreateCompanyDto";
import { GenericResponse } from "../../Application/Dtos/GenericResponseDto";

export interface ICompanyService {
    createCompany(data: CreateCompanyDto): Promise<GenericResponse>;
    findAll(page?: number, limit?: number): Promise<CompanyResponseDto[]>;
    findById(id: string): Promise<CompanyResponseDto | null>;
    findCompaniesAdheringLastMonth(): Promise<CompanyResponseDto[]>;
}
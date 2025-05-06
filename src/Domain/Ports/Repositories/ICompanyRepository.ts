import { Company } from '../../Entities/Company';

export interface ICompanyRepository {
    save(company: Company): Promise<Company>;
    findAll(skip?: number, take?: number): Promise<Company[]>;
    findById(id: string): Promise<Company | null>;
    findByCuit(cuit: string): Promise<Company | null>;
    findCompaniesAdheringLastMonth(): Promise<Company[]>;
    findByIds(ids: string[]): Promise<Company[]>;
    count(): Promise<number>;
    softDelete(id: string): Promise<boolean>;
}
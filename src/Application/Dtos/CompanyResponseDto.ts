export class CompanyResponseDto {
    id: number;
    uuid: string;
    cuit: string;
    businessName: string;
    adhesionDate: Date;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: Date;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
    @ApiProperty({
        description: 'ID numérico de la empresa',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'UUID de la empresa',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        format: 'uuid'
    })
    uuid: string;

    @ApiProperty({
        description: 'CUIT de la empresa',
        example: '30-71659554-9'
    })
    cuit: string;

    @ApiProperty({
        description: 'Nombre o razón social de la empresa',
        example: 'TechSolutions SA'
    })
    businessName: string;

    @ApiProperty({
        description: 'Fecha de adhesión (registro) de la empresa',
        example: '2025-04-10T14:30:00.000Z',
        format: 'date-time'
    })
    adhesionDate: Date;

    @ApiPropertyOptional({
        description: 'Dirección física de la empresa',
        example: 'Av. Corrientes 1234, CABA'
    })
    address?: string;

    @ApiPropertyOptional({
        description: 'Correo electrónico de contacto',
        example: 'info@techsolutions.com',
        format: 'email'
    })
    contactEmail?: string;

    @ApiPropertyOptional({
        description: 'Número de teléfono de contacto',
        example: '11-4567-8901'
    })
    contactPhone?: string;

    @ApiProperty({
        description: 'Indica si la empresa está activa',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Fecha de creación del registro',
        example: '2025-04-10T14:30:00.000Z',
        format: 'date-time'
    })
    createdAt: Date;
}
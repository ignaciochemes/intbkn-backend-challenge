import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyResponseDto } from './CompanyResponseDto';
import { TransferStatus } from 'src/Shared/Enums/TransferStatusEnum';

export class TransferResponseDto {
    @ApiProperty({
        description: 'ID numérico de la transferencia',
        example: 1
    })
    id: number;

    @ApiProperty({
        description: 'UUID de la transferencia',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid'
    })
    uuid: string;

    @ApiProperty({
        description: 'Monto de la transferencia',
        example: 25000.50
    })
    amount: number;

    @ApiProperty({
        description: 'Empresa relacionada con la transferencia',
        type: () => CompanyResponseDto
    })
    company: Partial<CompanyResponseDto>;

    @ApiProperty({
        description: 'Cuenta de origen (enmascarada)',
        example: '********9012'
    })
    debitAccount: string;

    @ApiProperty({
        description: 'Cuenta de destino (enmascarada)',
        example: '********2109'
    })
    creditAccount: string;

    @ApiProperty({
        description: 'Fecha de la transferencia',
        example: '2025-04-20T10:30:00.000Z',
        format: 'date-time'
    })
    transferDate: Date;

    @ApiProperty({
        description: 'Estado de la transferencia',
        enum: TransferStatus,
        example: TransferStatus.COMPLETED
    })
    status: TransferStatus;

    @ApiPropertyOptional({
        description: 'Descripción de la transferencia',
        example: 'Pago de servicios IT mensuales'
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'ID de referencia para la transferencia',
        example: 'REF-IT-20250420'
    })
    referenceId?: string;

    @ApiPropertyOptional({
        description: 'Fecha de procesamiento de la transferencia',
        example: '2025-04-20T10:35:00.000Z',
        format: 'date-time'
    })
    processedDate?: Date;

    @ApiProperty({
        description: 'Código de moneda en formato ISO 4217',
        example: 'ARS'
    })
    currency: string;

    @ApiProperty({
        description: 'Fecha de creación del registro',
        example: '2025-04-20T10:30:00.000Z',
        format: 'date-time'
    })
    createdAt: Date;
}
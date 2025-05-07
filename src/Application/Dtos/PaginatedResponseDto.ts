import { ApiProperty } from '@nestjs/swagger';

export interface IPaginationMetadata {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Colección de datos paginados',
        isArray: true
    })
    data: T[];

    @ApiProperty({
        description: 'Metadatos de paginación',
        type: 'object',
        properties: {
            currentPage: {
                type: 'number',
                description: 'Página actual',
                example: 1
            },
            pageSize: {
                type: 'number',
                description: 'Elementos por página',
                example: 10
            },
            totalItems: {
                type: 'number',
                description: 'Total de elementos',
                example: 42
            },
            totalPages: {
                type: 'number',
                description: 'Total de páginas',
                example: 5
            },
            hasNextPage: {
                type: 'boolean',
                description: '¿Hay página siguiente?',
                example: true
            },
            hasPreviousPage: {
                type: 'boolean',
                description: '¿Hay página anterior?',
                example: false
            }
        }
    })
    pagination: IPaginationMetadata;

    constructor(data: T[], pagination: IPaginationMetadata) {
        this.data = data;
        this.pagination = pagination;
    }
}
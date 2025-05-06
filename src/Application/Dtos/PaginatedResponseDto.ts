export interface IPaginationMetadata {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
    data: T[];
    pagination: IPaginationMetadata;

    constructor(data: T[], pagination: IPaginationMetadata) {
        this.data = data;
        this.pagination = pagination;
    }
}
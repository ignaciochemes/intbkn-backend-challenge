import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ITransferService } from '../../Domain/Services/ITransferService';
import { CreateTransferDto } from '../../Application/Dtos/CreateTransferDto';
import { TransferResponseDto } from '../../Application/Dtos/TransferResponseDto';
import { CompanyResponseDto } from '../../Application/Dtos/CompanyResponseDto';
import { GenericResponse } from '../../Application/Dtos/GenericResponseDto';
import { PaginatedResponseDto } from '../../Application/Dtos/PaginatedResponseDto';
import { TRANSFER_SERVICE } from '../../Shared/Constants/InjectionTokens';
import { LoggingInterceptor } from '../Interceptors/LoggingInterceptor';
import ResponseFormatter from '../Formatter/ResponseFormatter';
import { PaginatedQueryRequestDto } from '../../Application/Dtos/PaginatedQueryRequestDto';

@ApiTags('transfers')
@Controller('transfers')
@UseInterceptors(LoggingInterceptor)
export class TransferController {
    constructor(
        @Inject(TRANSFER_SERVICE)
        private readonly transferService: ITransferService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiOperation({ summary: 'Create a new transfer' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Transfer created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
    @ApiBody({ type: CreateTransferDto })
    @ApiResponse({ type: GenericResponse })
    async createTransfer(
        @Body() data: CreateTransferDto
    ): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this.transferService.createTransfer(data);
        return ResponseFormatter.create<GenericResponse>(response);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all transfers with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 0)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfers retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No transfers found' })
    @ApiResponse({ type: PaginatedResponseDto<TransferResponseDto[]> })
    async findAll(
        @Query() query: PaginatedQueryRequestDto,
    ): Promise<ResponseFormatter<PaginatedResponseDto<TransferResponseDto>>> {
        const response: PaginatedResponseDto<TransferResponseDto> = await this.transferService.findAll(query);
        return ResponseFormatter.create(response);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get transfer by ID' })
    @ApiParam({ name: 'id', description: 'Transfer ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfer retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transfer not found' })
    @ApiResponse({ type: TransferResponseDto })
    async findById(
        @Param('id') id: string
    ): Promise<ResponseFormatter<TransferResponseDto>> {
        const response: TransferResponseDto = await this.transferService.findById(id);
        return ResponseFormatter.create<TransferResponseDto>(response);
    }

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get transfers by company ID' })
    @ApiParam({ name: 'companyId', description: 'Company ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Transfers retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No transfers found' })
    @ApiResponse({ type: TransferResponseDto, isArray: true })
    async findByCompanyId(
        @Param('companyId') companyId: string
    ): Promise<ResponseFormatter<TransferResponseDto[]>> {
        const response: TransferResponseDto[] = await this.transferService.findByCompanyId(companyId);
        return ResponseFormatter.create<TransferResponseDto[]>(response);
    }

    @Get('companies/last-month')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get companies with transfers in the last month' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    @ApiResponse({ type: CompanyResponseDto, isArray: true })
    async findCompaniesWithTransfersLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this.transferService.findCompaniesWithTransfersLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}
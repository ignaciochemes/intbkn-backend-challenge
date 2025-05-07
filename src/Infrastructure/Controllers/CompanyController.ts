import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICompanyService } from '../../Domain/Services/ICompanyService';
import { CreateCompanyDto } from '../../Application/Dtos/CreateCompanyDto';
import { CompanyResponseDto } from '../../Application/Dtos/CompanyResponseDto';
import { GenericResponse } from '../../Application/Dtos/GenericResponseDto';
import { COMPANY_SERVICE } from '../../Shared/Constants/InjectionTokens';
import { LoggingInterceptor } from '../Interceptors/LoggingInterceptor';
import ResponseFormatter from '../Formatter/ResponseFormatter';
import { PaginatedResponseDto } from '../../Application/Dtos/PaginatedResponseDto';

@ApiTags('companies')
@Controller('companies')
@UseInterceptors(LoggingInterceptor)
export class CompanyController {
    constructor(
        @Inject(COMPANY_SERVICE)
        private readonly companyService: ICompanyService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiOperation({ summary: 'Create a new company' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Company created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Company with this CUIT already exists' })
    @ApiBody({ type: CreateCompanyDto })
    @ApiResponse({ type: GenericResponse })
    async createCompany(
        @Body() data: CreateCompanyDto
    ): Promise<ResponseFormatter<GenericResponse>> {
        const response: GenericResponse = await this.companyService.createCompany(data);
        return ResponseFormatter.create<GenericResponse>(response);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all companies with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    @ApiResponse({ type: PaginatedResponseDto<CompanyResponseDto[]>, isArray: true })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this.companyService.findAll(page, limit);
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get company by ID' })
    @ApiParam({ name: 'id', description: 'Company ID (numeric or UUID)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Company retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
    @ApiResponse({ type: CompanyResponseDto })
    async findById(
        @Param('id') id: string
    ): Promise<ResponseFormatter<CompanyResponseDto>> {
        const response: CompanyResponseDto = await this.companyService.findById(id);
        return ResponseFormatter.create<CompanyResponseDto>(response);
    }

    @Get('adhering/last-month')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get companies that adhered in the last month' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Companies retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No companies found' })
    @ApiResponse({ type: CompanyResponseDto, isArray: true })
    async findCompaniesAdheringLastMonth(): Promise<ResponseFormatter<CompanyResponseDto[]>> {
        const response: CompanyResponseDto[] = await this.companyService.findCompaniesAdheringLastMonth();
        return ResponseFormatter.create<CompanyResponseDto[]>(response);
    }
}
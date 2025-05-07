import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateCompanyDto {
    @ApiProperty({
        description: 'Número de CUIT de la empresa (identificación fiscal argentina)',
        example: '30-71659554-9',
        required: true
    })
    @IsNotEmpty({ message: 'CUIT is required' })
    @IsString({ message: 'CUIT must be a string' })
    @Matches(/^(20|23|24|25|26|27|30|33|34)(-\d{8}-\d{1}|\d{9})$/, {
        message: 'CUIT must follow the pattern: 2X-XXXXXXXX-X or 3XXXXXXXXX',
    })
    readonly cuit: string;

    @ApiProperty({
        description: 'Nombre o razón social de la empresa',
        example: 'TechSolutions SA',
        required: true,
        minLength: 3,
        maxLength: 100
    })
    @IsNotEmpty({ message: 'Business name is required' })
    @IsString({ message: 'Business name must be a string' })
    @Length(3, 100, { message: 'Business name must be between 3 and 100 characters' })
    @Matches(/^[a-zA-Z0-9\s\.,&()'-]+$/, {
        message: 'Business name contains invalid characters'
    })
    readonly businessName: string;

    @ApiPropertyOptional({
        description: 'Dirección física de la empresa',
        example: 'Av. Corrientes 1234, CABA',
        maxLength: 255
    })
    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    @Length(0, 255, { message: 'Address cannot exceed 255 characters' })
    readonly address?: string;

    @ApiPropertyOptional({
        description: 'Correo electrónico de contacto',
        example: 'info@techsolutions.com',
        format: 'email'
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly contactEmail?: string;

    @ApiPropertyOptional({
        description: 'Número de teléfono de contacto',
        example: '11-4567-8901',
        pattern: '^(\\+)?[0-9]{8,15}$'
    })
    @IsOptional()
    @IsString({ message: 'Contact phone must be a string' })
    @Matches(/^(\+)?[0-9]{8,15}$/, {
        message: 'Contact phone must contain 8-15 digits, optionally with a leading + symbol',
    })
    readonly contactPhone?: string;
}
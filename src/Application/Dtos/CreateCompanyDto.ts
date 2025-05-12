import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { BaseDto } from "./BaseDto";

@ValidatorConstraint({ name: 'isCuitValid', async: false })
export class IsCuitValidConstraint implements ValidatorConstraintInterface {
    validate(cuit: string, args: ValidationArguments) {
        if (!cuit) return false;

        // Limpiar el CUIT para trabajar solo con dígitos
        const cleanCuit = cuit.replace(/\D/g, '');
        if (cleanCuit.length !== 11) return false;

        // Verificar que comience con prefijo válido
        const validPrefixes = ['20', '23', '24', '25', '26', '27', '30', '33', '34'];
        const prefix = cleanCuit.substring(0, 2);
        if (!validPrefixes.includes(prefix)) return false;

        // Algoritmo para validar el dígito verificador de CUIT
        const digits = cleanCuit.split('').map(d => parseInt(d));
        const verifier = digits.pop(); // Último dígito es el verificador

        const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;

        for (let i = 0; i < multipliers.length; i++) {
            sum += digits[i] * multipliers[i];
        }

        let calculatedVerifier = 11 - (sum % 11);
        if (calculatedVerifier === 11) calculatedVerifier = 0;
        if (calculatedVerifier === 10) calculatedVerifier = 9;
        console.log(calculatedVerifier);
        console.log(verifier);
        return calculatedVerifier === verifier;
    }

    defaultMessage(args: ValidationArguments) {
        return 'CUIT is not valid. Please provide a valid Argentine tax ID with correct check digit.';
    }
}

// Validador personalizado para caracteres peligrosos en texto
@ValidatorConstraint({ name: 'noMaliciousChars', async: false })
export class NoMaliciousCharsConstraint implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        if (!text) return true;

        // Detectar posibles intentos de inyección
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /(\%27)|(\')|(--)|(%23)|(#)/i,
            /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(\;))/i,
            /\$\{.*\}/
        ];

        return !dangerousPatterns.some(pattern => pattern.test(text));
    }

    defaultMessage(args: ValidationArguments) {
        return 'The text contains potentially dangerous characters or patterns.';
    }
}

export class CreateCompanyDto extends BaseDto {
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
    @Validate(IsCuitValidConstraint, {
        message: 'CUIT is not valid. Please provide a valid Argentine tax ID with correct check digit.'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        // Normalize CUIT format to XX-XXXXXXXX-X
        const clean = value.replace(/\D/g, '');
        if (clean.length !== 11) return value;
        return `${clean.substr(0, 2)}-${clean.substr(2, 8)}-${clean.substr(10, 1)}`;
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
    @MinLength(3, { message: 'Business name must be at least 3 characters long' })
    @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
    @Matches(/^[a-zA-Z0-9\s\.,&()'-]+$/, {
        message: 'Business name can only contain alphanumeric characters and basic punctuation (.,:&\'"-)'
    })
    @Validate(NoMaliciousCharsConstraint, {
        message: 'Business name contains potentially dangerous characters'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        const dto = new CreateCompanyDto();
        return dto.sanitizeText(value);
    })
    readonly businessName: string;

    @ApiPropertyOptional({
        description: 'Dirección física de la empresa',
        example: 'Av. Corrientes 1234, CABA',
        maxLength: 255
    })
    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    @MaxLength(255, { message: 'Address must not exceed 255 characters' })
    @Validate(NoMaliciousCharsConstraint, {
        message: 'Address contains potentially dangerous characters'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        return value.trim().replace(/\s+/g, ' ');
    })
    readonly address?: string;

    @ApiPropertyOptional({
        description: 'Correo electrónico de contacto',
        example: 'info@techsolutions.com',
        format: 'email'
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(100, { message: 'Email must not exceed 100 characters' })
    @Transform(({ value }: TransformFnParams) => value ? value.toLowerCase().trim() : value)
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
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        return value.toLowerCase().trim();
    })
    readonly contactPhone?: string;
}
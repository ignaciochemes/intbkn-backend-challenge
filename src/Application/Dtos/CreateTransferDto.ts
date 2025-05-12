import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Length,
    Matches,
    Max,
    MaxLength,
    MinLength,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { TransferStatus } from "../../Shared/Enums/TransferStatusEnum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import { BaseDto } from "./BaseDto";

@ValidatorConstraint({ name: 'accountsNotEqual', async: false })
export class AccountsNotEqualConstraint implements ValidatorConstraintInterface {
    validate(debitAccount: string, args: ValidationArguments) {
        const object = args.object as CreateTransferDto;
        const creditAccount = object.creditAccount;

        if (!debitAccount || !creditAccount) return true;

        // Normalizar cuentas para comparación
        const normalizedDebit = debitAccount.replace(/\D/g, '');
        const normalizedCredit = creditAccount.replace(/\D/g, '');

        return normalizedDebit !== normalizedCredit;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Debit and credit accounts cannot be the same';
    }
}

@ValidatorConstraint({ name: 'isCurrencyCodeValid', async: false })
export class IsCurrencyCodeValidConstraint implements ValidatorConstraintInterface {
    validate(currencyCode: string, args: ValidationArguments) {
        if (!currencyCode) return true;

        // Lista completa de códigos de moneda ISO 4217 válidos
        const validCurrencyCodes = [
            'ARS', 'USD', 'EUR', 'GBP', 'JPY', 'BRL', 'CLP',
            'UYU', 'PYG', 'BOB', 'COP', 'PEN', 'VES', 'MXN',
            'CAD', 'AUD', 'NZD', 'CHF', 'CNY', 'HKD', 'SGD',
            'INR', 'ZAR', 'RUB', 'TRY', 'SEK', 'NOK', 'DKK'
        ];

        return validCurrencyCodes.includes(currencyCode.toUpperCase());
    }

    defaultMessage(args: ValidationArguments) {
        return 'Currency code is not valid. Please provide a valid 3-letter ISO currency code.';
    }
}

// Validador para asegurar que las cuentas bancarias tengan formato válido
@ValidatorConstraint({ name: 'isValidAccountFormat', async: false })
export class IsValidAccountFormatConstraint implements ValidatorConstraintInterface {
    validate(account: string, args: ValidationArguments) {
        if (!account) return false;

        // Limpiar la cuenta para trabajar solo con dígitos
        const cleanAccount = account.replace(/\D/g, '');

        // Verificar la longitud (entre 5 y 20 dígitos)
        if (cleanAccount.length < 5 || cleanAccount.length > 20) return false;

        // Asegurar que no sean todos dígitos iguales (potencial error)
        if (/^(\d)\1+$/.test(cleanAccount)) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'The account number format is not valid. It must contain 5-20 digits and cannot be all the same digit.';
    }
}

// Validador para descripción segura
@ValidatorConstraint({ name: 'safeDescription', async: false })
export class SafeDescriptionConstraint implements ValidatorConstraintInterface {
    validate(description: string, args: ValidationArguments) {
        if (!description) return true;

        // Detectar patrones peligrosos en descripciones
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /ondblclick|onclick|onmouseover|onload|onerror/i,
            /(\%27)|(\')|(--)|(%23)|(#)/i,
            /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(\;))/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(description));
    }

    defaultMessage(args: ValidationArguments) {
        return 'The description contains potentially dangerous code or characters.';
    }
}

export class CreateTransferDto extends BaseDto {
    @ApiProperty({
        description: 'Monto de la transferencia',
        example: 25000.50,
        minimum: 0.01,
        maximum: 1000000,
        required: true
    })
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber({
        maxDecimalPlaces: 2,
        allowNaN: false,
        allowInfinity: false
    }, { message: 'Amount must be a valid number with at most 2 decimal places' })
    @IsPositive({ message: 'Amount must be positive' })
    @Max(1000000, { message: 'Amount cannot exceed 1,000,000' })
    @Type(() => Number)
    public amount: number;

    @ApiProperty({
        description: 'UUID de la empresa que realiza la transferencia',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        format: 'uuid',
        required: true
    })
    @IsNotEmpty({ message: 'Company ID is required' })
    @IsString({ message: 'Company ID must be a string' })
    @IsUUID('4', { message: 'Company ID must be a valid UUID' })
    public companyId: string;

    @ApiProperty({
        description: 'Cuenta de origen para la transferencia',
        example: '123456789012',
        pattern: '^\\d{5,12}$',
        required: true
    })
    @IsNotEmpty({ message: 'Debit account is required' })
    @IsString({ message: 'Debit account must be a string' })
    @Matches(/^\d{5,12}$/, { message: 'Debit account must contain 5-12 digits' })
    @Validate(AccountsNotEqualConstraint, {
        message: 'Debit and credit accounts cannot be the same'
    })
    @Validate(IsValidAccountFormatConstraint, {
        message: 'Invalid account format. Account must contain 5-20 digits and cannot be all the same digit.'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        const dto = new CreateTransferDto();
        return dto.normalizeAccountNumber(value);
    })
    public debitAccount: string;

    @ApiProperty({
        description: 'Cuenta de destino para la transferencia',
        example: '098765432109',
        pattern: '^\\d{5,12}$',
        required: true
    })
    @IsNotEmpty({ message: 'Credit account is required' })
    @IsString({ message: 'Credit account must be a string' })
    @Matches(/^\d{5,12}$/, { message: 'Credit account must contain 5-12 digits' })
    @Validate(IsValidAccountFormatConstraint, {
        message: 'Invalid account format. Account must contain 5-20 digits and cannot be all the same digit.'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        // Normalizar cuenta eliminando caracteres no numéricos
        return value.replace(/\D/g, '');
    })
    public creditAccount: string;

    @ApiPropertyOptional({
        description: 'Descripción de la transferencia',
        example: 'Pago de servicios IT mensuales',
        maxLength: 500
    })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MinLength(3, { message: 'Description should be at least 3 characters long if provided' })
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    @Validate(SafeDescriptionConstraint, {
        message: 'Description contains potentially unsafe characters or patterns'
    })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        const dto = new CreateTransferDto();
        return dto.sanitizeText(value);
    })
    public description?: string;

    @ApiPropertyOptional({
        description: 'ID de referencia para la transferencia',
        example: 'REF-IT-20250420',
        maxLength: 50,
        pattern: '^[a-zA-Z0-9\\-_]+$'
    })
    @IsOptional()
    @IsString({ message: 'Reference ID must be a string' })
    @MinLength(3, { message: 'Reference ID should be at least 3 characters long' })
    @MaxLength(50, { message: 'Reference ID cannot exceed 50 characters' })
    @Matches(/^[a-zA-Z0-9\-_]+$/, { message: 'Reference ID can only contain alphanumeric characters, dashes, and underscores' })
    @Transform(({ value }: TransformFnParams) => {
        if (!value) return value;
        // Normalizar referenceId (eliminar espacios, convertir a mayúsculas)
        return value.trim().toUpperCase();
    })
    public referenceId?: string;

    @ApiPropertyOptional({
        description: 'Estado de la transferencia',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
        example: TransferStatus.PENDING
    })
    @IsOptional()
    @IsEnum(TransferStatus, { message: 'Invalid transfer status' })
    public status?: TransferStatus;

    @ApiPropertyOptional({
        description: 'Código de moneda en formato ISO 4217',
        example: 'ARS',
        enum: ['ARS', 'USD', 'EUR', 'GBP', 'JPY', 'BRL'],
        default: 'ARS'
    })
    @IsOptional()
    @IsString({ message: 'Currency must be a string' })
    @Length(3, 3, { message: 'Currency must be a 3-letter code (e.g., ARS, USD)' })
    @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter uppercase code' })
    @Validate(IsCurrencyCodeValidConstraint, {
        message: 'Currency code is not valid. Please provide a valid 3-letter ISO currency code.'
    })
    @Transform(({ value }: TransformFnParams) => value ? value.toUpperCase() : value)
    public currency?: string;
}
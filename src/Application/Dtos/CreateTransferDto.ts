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
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { TransferStatus } from "../../Shared/Enums/TransferStatusEnum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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

        // Lista de códigos de moneda ISO 4217 válidos
        const validCurrencyCodes = [
            'ARS', 'USD', 'EUR', 'GBP', 'JPY', 'BRL', 'CLP',
            'UYU', 'PYG', 'BOB', 'COP', 'PEN', 'VES', 'MXN'
        ];

        return validCurrencyCodes.includes(currencyCode);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Currency code is not valid. Please provide a valid 3-letter ISO currency code.';
    }
}

export class CreateTransferDto {
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
    readonly companyId: string;

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
    public creditAccount: string;

    @ApiPropertyOptional({
        description: 'Descripción de la transferencia',
        example: 'Pago de servicios IT mensuales',
        maxLength: 500
    })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
    @Matches(/^[a-zA-Z0-9\s\.,;:'"()[\]{}!?@#$%^&*\-_=+]*$/, {
        message: 'Description contains disallowed characters'
    })
    readonly description?: string;

    @ApiPropertyOptional({
        description: 'ID de referencia para la transferencia',
        example: 'REF-IT-20250420',
        maxLength: 50,
        pattern: '^[a-zA-Z0-9\\-_]+$'
    })
    @IsOptional()
    @IsString({ message: 'Reference ID must be a string' })
    @Length(0, 50, { message: 'Reference ID cannot exceed 50 characters' })
    @Matches(/^[a-zA-Z0-9\-_]+$/, { message: 'Reference ID can only contain alphanumeric characters, dashes, and underscores' })
    readonly referenceId?: string;

    @ApiPropertyOptional({
        description: 'Estado de la transferencia',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
        example: TransferStatus.PENDING
    })
    @IsOptional()
    @IsEnum(TransferStatus, { message: 'Invalid transfer status' })
    readonly status?: TransferStatus;

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
    readonly currency?: string;
}
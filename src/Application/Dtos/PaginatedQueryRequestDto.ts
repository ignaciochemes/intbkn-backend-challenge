import {
    IsOptional,
    IsInt,
    Min,
    Max,
    ValidateIf,
    ValidationOptions,
    registerDecorator,
    ValidationArguments
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseDto } from "./BaseDto";

// Decorador personalizado para validación numérica estricta
export function IsStrictlyNumeric(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStrictlyNumeric',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (value === undefined || value === null) return true;
                    return typeof value === 'string'
                        ? /^[0-9]+$/.test(value)
                        : Number.isInteger(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe contener únicamente dígitos numéricos`;
                }
            }
        });
    };
}

export class PaginatedQueryRequestDto extends BaseDto {
    @ApiPropertyOptional({
        description: 'Número de página para paginación (comenzando desde 0)',
        example: 0,
        minimum: 0,
        default: 0,
        type: Number
    })
    @IsOptional()
    @IsStrictlyNumeric({
        message: 'Param must contain only numeric digits'
    })
    @ValidateIf(o => o.page !== undefined && o.page !== null)
    @Type(() => Number)
    @IsInt({ message: 'The page must be an integer' })
    @Min(0, { message: 'Page number must be at least 0' })
    @Max(1000000, { message: 'Page number cannot exceed 1,000,000' })
    public page?: number;

    @ApiPropertyOptional({
        description: 'Número de elementos por página (máximo 100)',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        type: Number
    })
    @IsOptional()
    @IsStrictlyNumeric({
        message: 'Param must contain only numeric digits'
    })
    @ValidateIf(o => o.limit !== undefined && o.limit !== null)
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    public limit?: number;
}
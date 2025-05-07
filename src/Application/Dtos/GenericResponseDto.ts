import { ApiProperty } from "@nestjs/swagger";

export class GenericResponse {
    @ApiProperty({ description: 'Generic response message', example: 'Operation completed successfully' })
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationProductDto {
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;


    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset: number;

}
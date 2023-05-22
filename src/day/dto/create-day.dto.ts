import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
 
export class CreateDayDto {

    @IsOptional()
    @IsString()
    date?: string;
    
    @IsString()
    // @MinLength(0)
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    picture?: string;

    @IsString()
    @IsOptional()
    estado?: string;

}



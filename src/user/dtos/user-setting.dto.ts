import { IsOptional, MinLength, IsString, MaxLength, IsBoolean,IsLocale } from "class-validator";

export class UserSettingDTO
{
    @IsOptional()
    @IsLocale()
    language:string;

    @IsOptional()
    @MinLength(4)
    @IsString()
    @MaxLength(65)
    theme:string;

    @IsOptional()
    @MinLength(4)
    @IsString()
    @MaxLength(65)
    currency:string;

    @IsOptional()
    @IsBoolean()
    isEnglishTimeFormat:boolean;
}
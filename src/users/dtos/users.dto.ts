import { IsAlpha, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UsersDto{
     @IsString()
     @IsAlpha()
     firstName:string;
     @IsString()
     @IsAlpha()
     lastName:string;
     @IsNotEmpty()
     @IsString()
     username:string;
     @IsNotEmpty()
     @IsEmail()
     email:string;
     @IsNotEmpty()
     @IsString()
     @MinLength(4)
     @MaxLength(8)
     password:string 
}

export class LoginDto{
    @IsNotEmpty()
    @IsString()
    username:string;

    @IsNotEmpty()
    @IsString()
    password:string 
}
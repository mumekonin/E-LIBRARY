import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "../services/users.services";
import { LoginDto, UsersDto } from "../dtos/users.dto";

@Controller('users')
export class UserController{
  constructor(
    private readonly userService:UserService
  ){}
  @Post('register')
  async registerUser(@Body() usersDTO:UsersDto){
    const result = await this.userService.createUserAccount(usersDTO);
    return result;
  }

  @Post('login')
  async login(@Body() loginDto:LoginDto){
    const result = await this.userService.userLogin(loginDto);
    return result;
  }
}
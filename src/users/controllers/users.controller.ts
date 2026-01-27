import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { UserService } from "../services/users.services";
import { LoginDto, UsersDto } from "../dtos/users.dto";
import { JwtAuthGuard } from "src/commons/guards/jwtauth.gourd";

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
  @JwtAuthGuard()
  @Post('register-librarian')
  async registerLibrarian(@Body() usersDTO:UsersDto, @Req() req){
     const currentUser =req.user.userId;
     const result = await this.userService.createLibrarianAccount(usersDTO,currentUser);
     return result;
  }
}
import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../services/users.services";
import { UsersDto } from "../dtos/users.dto";

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
}
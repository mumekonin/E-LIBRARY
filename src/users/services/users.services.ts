import { BadRequestException, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { UsersSchema } from "../schema/users.schema";
import { InjectModel } from "@nestjs/mongoose";
import { UsersDto } from "../dtos/users.dto";
import * as bcrypt from 'bcrypt';
import { UserResponse } from "../responses/users.respnses";
@Injectable()
export class UserService{
  constructor(
    @InjectModel(UsersSchema.name)
    private readonly userModule:Model<UsersSchema>
  ){}
  async createUserAccount(usersDto:UsersDto){
    //CHECK IF THE USER IS EXISTS
    const userExists= await  this.userModule.findOne({username:usersDto.username.toLowerCase()});

    if(userExists){
      throw new BadRequestException('user already exists');
    }
    //hashed password
    const hashedPWD= await bcrypt.hash(usersDto.password,10);
    //role assignment
    let role='student';
    //prepare an instance to be saved
    const newUser = new this.userModule({
        firstName:usersDto.firstName,
        lastName:usersDto.lastName,
        username:usersDto.username.toLowerCase(),
        email:usersDto.email.toLowerCase(),
        password:hashedPWD,
        role:role
    });
    const savedUser= await newUser.save();
    //map to user response interceptor
        const UserResponse: UserResponse = {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          username: savedUser.username,
          role: savedUser.role,
        };
        return UserResponse;  
    }
  }
  

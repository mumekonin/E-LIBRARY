import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { UsersSchema } from "../schema/users.schema";
import { InjectModel } from "@nestjs/mongoose";
import { LoginDto, UsersDto } from "../dtos/users.dto";
import * as bcrypt from 'bcrypt';
import { UserResponse } from "../responses/users.respnses";
import { commonUtils } from "src/commons/utils";
@Injectable()
export class UserService {
  constructor(
    @InjectModel(UsersSchema.name)
    private readonly userModule: Model<UsersSchema>
  ) { }
  async createUserAccount(usersDto: UsersDto) {
    //CHECK IF THE USER IS EXISTS
    const userExists = await this.userModule.findOne({ username: usersDto.username.toLowerCase() });

    if (userExists) {
      throw new BadRequestException('user already exists');
    }
    //hashed password
    const hashedPWD = await bcrypt.hash(usersDto.password, 10);
    //role assignment
    let role = 'student';
    //prepare an instance to be saved
    const newUser = new this.userModule({
      firstName: usersDto.firstName,
      lastName: usersDto.lastName,
      username: usersDto.username.toLowerCase(),
      email: usersDto.email.toLowerCase(),
      password: hashedPWD,
      role: role
    });
    const savedUser = await newUser.save();
    //map to user response interceptor
    const UserResponse: UserResponse = {
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      username: savedUser.username,
      role: savedUser.role,
    };
    return UserResponse;
  }
  async userLogin(loginDto: LoginDto) {
    //check if the user exists
    const user = await this.userModule.findOne({ username: loginDto.username.toLowerCase() });
    if (!user) {
      throw new BadRequestException('username is not found');
    }
    //compare password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('invalid password');
    }
    const jwtData ={
       userId:user._id,
       username:user.username
    };

    const generateJwtToken = commonUtils.generateJwtToken(jwtData);

    return { token: generateJwtToken };
  }
  async createLibrarianAccount(usersDto: UsersDto, currentUser: UsersSchema) {
    //check if the current user is admin 
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin can create librarian');
    }
    //check if the librarian already  
    const librarianExists = await this.userModule.findOne({ username: usersDto.username.toLowerCase() });

    if (librarianExists) {
      throw new BadRequestException('librarian already exists');
    }

    //hashed password
    const hashedPWD = await bcrypt.hash(usersDto.password, 10);
    //create librarian 

    const newLibrarian = new this.userModule({
      firstName: usersDto.firstName,
      lastName: usersDto.lastName,
      username: usersDto.username.toLowerCase(),
      email: usersDto.email.toLowerCase(),
      password: hashedPWD,
      role: 'librarian'
    });
    const savedLibrarian = await newLibrarian.save();
    //map to user response interceptor
    const UserResponse: UserResponse = {
      firstName: savedLibrarian.firstName,
      lastName: savedLibrarian.lastName,
      username: savedLibrarian.username,
      role: savedLibrarian.role,
    };
    return UserResponse;
  }
}
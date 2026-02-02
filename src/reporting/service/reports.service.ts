import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReportSchema } from "../schema/reports.shema";
import { UsersSchema } from "src/users/schema/users.schema";

@Injectable()
export class ReportsService{
   constructor(
       @InjectModel(ReportSchema.name) private readonly rportModel:Model<ReportSchema>,
       @InjectModel(UsersSchema.name) private readonly userModel:Model<UsersSchema>
   ){}
 //check user activity report
 async fetchUserReports(currentUserId,userId:string){
   //check if user exists
   const user = await this.userModel.findById(userId);
   if(!user){
     throw new BadRequestException("User not found");
   }
   //check current user is admin
   const currentUser = await this.userModel.findById(currentUserId)
   if
 }
}
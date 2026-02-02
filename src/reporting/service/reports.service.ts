import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReportSchema } from "../schema/reports.shema";
import { UsersSchema } from "src/users/schema/users.schema";

@Injectable()
export class ReportsService{
   constructor(
       @InjectModel(ReportSchema.name) private readonly reportModel:Model<ReportSchema>,
       @InjectModel(UsersSchema.name) private readonly userModel:Model<UsersSchema>
   ){}
  //create rgistor reports
  async registorReports(userId:string,action:string,bookId?:string,details?:string){
         await this.reportModel.create({
          userId,
          action,
          bookId,
          details,
          timestamp:new Date()
         });
  }
 //check user activity report
async fetchUserReports(currentUserId: any, userId: string) {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  const currentUser = await this.userModel.findById(currentUserId);
  if (!currentUser) {
    throw new BadRequestException("Current user not found");
  }

  //! Allow admins to view any user's logs, regular users only their own
  if (currentUser.role !== 'admin' && currentUserId !== userId) {
    throw new ForbiddenException("You are not eligible to see these logs");
  }

  const reports = await this.reportModel.find({ userId }).sort({ timestamp: -1 });

  return {
    userId,
    logs: reports.map(r => ({
      action: r.action,
      timestamp: r.timestamp,
      details: r.details,
    })),
  };
}
}
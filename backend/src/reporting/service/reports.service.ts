import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReportBooKSchema, ReportSchema } from "../schema/reports.shema";
import { UsersSchema } from "src/users/schema/users.schema";
import { BookCatalog } from "src/accessManagement/schema/access.schema";
@Injectable()
export class ReportsService{
   constructor(
       @InjectModel(ReportSchema.name) private readonly reportModel:Model<ReportSchema>,
       @InjectModel(UsersSchema.name) private readonly userModel:Model<UsersSchema>,
       @InjectModel(ReportBooKSchema.name)
       private readonly reportBookModel:Model<ReportBooKSchema>,
       @InjectModel(BookCatalog.name)
       private readonly bookCatalogModel:Model<BookCatalog>
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

  const reports = await this.reportModel.find({ userId }).sort({ timestamp: -1 });//sort from new to old

  return {
    userId,
    logs: reports.map(r => ({
      action: r.action,
      timestamp: r.timestamp,
      details: r.details,
    })),
  };
}
async registorBorrowAndReturnRports(userId:string,bookId:any ,action:string){
    //check if the book exists
    const book = await this.bookCatalogModel.findById(bookId);
    if(!book){
      throw new BadRequestException("book is not found");
    } 
    //check if the user exists
    const user =await this.userModel.findById(userId);
    if(!user){
      throw new BadRequestException("user is not found");
    }  
    //create report 
    const report = new this.reportBookModel({
         userId:user._id,
         bookId:book._id,
         action,
         timestamp:new Date()
    });
    const reportSaved =await report.save();
}
async fetchBookReports(bookId: string) {
  // check if book exists
  const book = await this.bookCatalogModel.findById(bookId);
  if (!book) {
    throw new BadRequestException('Book not found');
  }

  // fetch actions
    const reports = await this.reportBookModel
    .find({ bookId:bookId })
    .sort({ timestamp: -1 })
  return {
    bookId,
    //!check is needed
    logs: reports.map(r => ({
      userId: r.userId,
      action: r.action,
      timestamp: r.timestamp,
    })),
  };
 }
}

import { Controller, Get, Param, Req } from "@nestjs/common";
import { ReportsService } from "../service/reports.service";
import { JwtAuthGuard } from "src/commons/guards/jwtauth.gourd";
@Controller('logs')
export class ReportController{
  constructor(
    private readonly reportService:ReportsService
  ){}
  @JwtAuthGuard()
  @Get('users/:id')
   async fetchUserLog(@Req() req,@Param('id') id:string){
    const currentUserId = req.user.userId;
    const result = await this.reportService.fetchUserReports(currentUserId,id)
    return result;
  }
  @JwtAuthGuard()
  @Get('books/:id')
  async fetchBookLog(@Param('id') id:string){
    const result = await this.reportService.fetchBookReports(id);
    return result;
  }
  
}
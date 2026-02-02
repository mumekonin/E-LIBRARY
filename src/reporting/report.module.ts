import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";  
import { reportSchema, ReportSchema } from "./schema/reports.shema";
import { ReportsService } from "./service/reports.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReportSchema.name, schema: reportSchema }])
  ],
  controllers: [],
  providers: [ReportsService],
})
export class ReportModule { }
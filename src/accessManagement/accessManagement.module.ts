import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookCatalog,Borrow, bookCatalogSchema, borrowSchema } from "./schema/access.schema";
import { BookCatalogService } from "./service/access.service";
import {  BookCatalogController } from "./controller/access.controller";
import { userSchema, UsersSchema } from "src/users/schema/users.schema";
import { ReportsService } from "src/reporting/service/reports.service";
import { ReportModule } from "src/reporting/report.module";
import { reportBookSchema, ReportBooKSchema, reportSchema, ReportSchema } from "src/reporting/schema/reports.shema";

@Module({ 
  imports:[ MongooseModule.forFeature([
      {name:BookCatalog.name, schema: bookCatalogSchema},
      {name:UsersSchema.name,schema:userSchema},
      {name:Borrow.name, schema:borrowSchema},  
      {name:ReportSchema.name ,schema:reportSchema},
      {name:ReportBooKSchema.name ,schema:reportBookSchema},
    ]),ReportModule],
  controllers: [BookCatalogController],
  providers: [BookCatalogService, ReportsService]
})
export class AccessManagementModule{}
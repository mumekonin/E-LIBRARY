import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users.controller";
import { UserService } from "./services/users.services";
import { MongooseModule } from "@nestjs/mongoose";
import { userSchema, UsersSchema } from "./schema/users.schema";
import { ReportsService } from "src/reporting/service/reports.service";
import { reportBookSchema, ReportBooKSchema, reportSchema, ReportSchema } from "src/reporting/schema/reports.shema";
import { BookCatalog, bookCatalogSchema } from "src/accessManagement/schema/access.schema";
@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: UsersSchema.name, schema: userSchema},
      {name:ReportSchema.name ,schema:reportSchema},
      {name:ReportBooKSchema.name ,schema:reportBookSchema},
      {name:BookCatalog.name,schema:bookCatalogSchema}
    ])],
  controllers: [UserController],
  providers: [UserService,ReportsService],
})
export class UserModule{}
import { Module } from "@nestjs/common";
import { UserController } from "./controllers/users.controller";
import { UserService } from "./services/users.services";
import { MongooseModule } from "@nestjs/mongoose";
import { userSchema, UsersSchema } from "./schema/users.schema";
import { commonUtils } from "src/commons/utils";
import { ReportsService } from "src/reporting/service/reports.service";
import { reportSchema, ReportSchema } from "src/reporting/schema/reports.shema";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: UsersSchema.name, schema: userSchema},
      {name:ReportSchema.name ,schema:reportSchema}
    ])],
  controllers: [UserController],
  providers: [UserService,commonUtils,ReportsService],
})
export class UserModule {}
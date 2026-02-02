import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";  
import { reportSchema, ReportSchema } from "./schema/reports.shema";
import { ReportsService } from "./service/reports.service";
import { ReportController } from "./controller/reports.controller";
import { UsersSchema ,userSchema} from "src/users/schema/users.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportSchema.name, schema: reportSchema },
      {name:UsersSchema.name , schema:userSchema}
    ])
  ],
  controllers: [ReportController],
  providers: [ReportsService],
})
export class ReportModule { }
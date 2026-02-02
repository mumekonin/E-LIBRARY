import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";  
import { reportBookSchema, ReportBooKSchema, reportSchema, ReportSchema } from "./schema/reports.shema";
import { ReportsService } from "./service/reports.service";
import { ReportController } from "./controller/reports.controller";
import { UsersSchema ,userSchema} from "src/users/schema/users.schema";
import { BookCatalog ,bookCatalogSchema} from "src/accessManagement/schema/access.schema";
import { UserModule } from "src/users/users.module";
import { UserService } from "src/users/services/users.services";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: ReportSchema.name, schema: reportSchema },
      {name:UsersSchema.name ,schema:userSchema},
      {name:ReportBooKSchema.name,schema:reportBookSchema},
      {name:BookCatalog.name,schema:bookCatalogSchema}
    ])
  ],
  controllers: [ReportController],
  providers: [ReportsService],
})
export class ReportModule { }
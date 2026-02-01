import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookCatalog, bookCatalogSchema } from "./schema/access.schema";
import { BookCatalogService } from "./service/access.service";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: BookCatalog.name, schema: bookCatalogSchema},
      
    ])],
  controllers: [],
  providers: [BookCatalogService]
})
export class AccessManagementModule { }
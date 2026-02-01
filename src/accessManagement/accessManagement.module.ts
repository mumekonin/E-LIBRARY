import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookCatalog, bookCatalogSchema } from "./schema/access.schema";
import { BookCatalogService } from "./service/access.service";
import {  BookCatalogController } from "./controller/access.controller";
import { userSchema, UsersSchema } from "src/users/schema/users.schema";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: BookCatalog.name, schema: bookCatalogSchema},
      {name:UsersSchema.name,schema:userSchema},
      
    ])],
  controllers: [BookCatalogController],
  providers: [BookCatalogService]
})
export class AccessManagementModule { }
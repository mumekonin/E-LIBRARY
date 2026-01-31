import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { bookSchema, BooksSchema, catagorySchema, CatagorySchema } from "./schemas/books.schema";
import { BooksService } from "./services/books.service";
import { BooksController } from "./controllers/books.controller";
import { commonUtils } from "src/commons/utils";
import { UsersSchema,userSchema } from "src/users/schema/users.schema";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: BooksSchema.name, schema: bookSchema},
      {name:CatagorySchema.name,schema:catagorySchema},
      {name:UsersSchema.name,schema:userSchema}  
    ])],
  controllers: [BooksController],
  providers: [BooksService,commonUtils],
})
export class BookManagementModule {}
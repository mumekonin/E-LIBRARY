import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { bookSchema, BooksSchema } from "./schemas/books.schema";
import { BooksService } from "./services/books.service";
import { BooksController } from "./controllers/books.controller";
import { commonUtils } from "src/commons/utils";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: BooksSchema.name, schema: bookSchema}
    ])],
  controllers: [BooksController],
  providers: [BooksService,commonUtils],
})
export class BookManagementModule {}
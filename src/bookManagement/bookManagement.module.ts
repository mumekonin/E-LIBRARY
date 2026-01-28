import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { bookSchema, BooksSchema } from "./schemas/books.schema";
import { BooksService } from "./services/books.service";
import { BooksController } from "./controllers/books.controller";

@Module({ 
  imports:[ MongooseModule.forFeature([
      { name: BooksSchema.name, schema: bookSchema}
    ])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BookManagementModule {}
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { BooksSchema } from "../schemas/books.schema";
import { CreateBookDto } from "../dtos/books.dto";
import { BookResponse } from "../responses/books.response";
import { InjectModel } from "@nestjs/mongoose";
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(BooksSchema.name)
    private readonly booksModel: Model<BooksSchema>
  ) { }
  async createBook(createBookDto: CreateBookDto, file: Express.Multer.File) {
    const newBook = new this.booksModel({
      ...createBookDto, // include all DTO fields
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
    });
    const saveBooks = await newBook.save();
    const bookResponse: BookResponse = {
      id: saveBooks._id.toString(),
      title: saveBooks.title,
      author: saveBooks.author,
      description: saveBooks.description,
      createdAt: saveBooks.createdAt,
      updatedAt: saveBooks.updatedAt
    }
  }
}

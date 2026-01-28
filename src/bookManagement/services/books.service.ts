import { BadRequestException, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { BooksSchema } from "../schemas/books.schema";
import { CreateBookDto } from "../dtos/books.dto";
import { BookResponse } from "../responses/books.response";
import { InjectModel } from "@nestjs/mongoose";
import { commonUtils } from "src/commons/utils";
import * as fs from 'fs';
import { title } from "process";
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(BooksSchema.name)
    private readonly booksModel: Model<BooksSchema>,
    //private readonly commonUtiles:commonUtils
  ) { }
  async createBook(createBookDto: CreateBookDto, file: Express.Multer.File) {
    //check if the duplicate file is exists
    const fileHash = commonUtils.generateFileHash(file);
    const existingBook = await this.booksModel.findOne({ fileHash, });
    console.log(existingBook)
    if (existingBook) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('This file already exists');
    }

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
    return bookResponse;
  }
  //retrive all books
  async getAllBooks() {
    const books = await this.booksModel.find();
    if (!books || books.length === 0) {
      throw new BadRequestException("no book is found");
    }
    const booksResponse: BookResponse[] = books.map((books) => {
      return {
        id: books._id.toString(),
        title: books.title,
        author: books.author,
        description: books.description,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt
      }
    });
    return booksResponse
  }
  //get single book detiles
  async getBookDetail(bookId: string) {
    //check if the book found on the database
    const bookToBeFind = await this.booksModel.findById(bookId);
    if (!bookToBeFind) {
      throw new BadRequestException("book is not found");
    }
    //map to book response
    const bookDetailResponse: BookResponse = {
      id: bookToBeFind._id.toString(),
      title: bookToBeFind.title,
      author: bookToBeFind.author,
      description: bookToBeFind.description,
      createdAt: bookToBeFind.createdAt,
      updatedAt: bookToBeFind.updatedAt

    }
    return bookDetailResponse;
  }
}

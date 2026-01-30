import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { BooksSchema, CatagorySchema } from "../schemas/books.schema";
import { CreateBookDto, CreateCategoryDto } from "../dtos/books.dto";
import { BookResponse, CategoryResponse } from "../responses/books.response";
import { InjectModel } from "@nestjs/mongoose";
import { commonUtils } from "src/commons/utils";
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(BooksSchema.name)
    private readonly booksModel: Model<BooksSchema>,
    @InjectModel(CatagorySchema.name)
    private readonly categoryModel:Model<CatagorySchema>
    //private readonly commonUtiles:commonUtils
  ) { }
  async createBook(createBookDto: CreateBookDto, file: Express.Multer.File) {
    const fileHash = commonUtils.generateFileHash(file);
    const existingBook = await this.booksModel.findOne({ fileHash });
    if (existingBook) {
      throw new BadRequestException("file is duplicated");
    }
    const newBook = new this.booksModel({
      //check if the file is duplicated using file hash
      ...createBookDto, // include all DTO fields
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      fileHash: fileHash
    });

    const saveBooks = await newBook.save();
    const bookResponse: BookResponse = {
      id: saveBooks._id.toString(),
      title: saveBooks.title,
      author: saveBooks.author,
      description: saveBooks.description,
      filetype: saveBooks.fileType,
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
        filetype: books.fileType,
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
      filetype: bookToBeFind.fileType,
      createdAt: bookToBeFind.createdAt,
      updatedAt: bookToBeFind.updatedAt

    }
    return bookDetailResponse;
  }
  //updateBook
  async updateBookFile(bookId: string, createBookDto: CreateBookDto, file: Express.Multer.File) {
    //check if the book found in db
    const book = await this.booksModel.findById(bookId);
    if (!book) {
      throw new BadRequestException("book is not found");
    }
    try {
      //remove the old file from the storage
      if (book.filePath && fs.existsSync(book.filePath)) {
        fs.unlinkSync(book.filePath);
      }
      //hash the new file
      const fileHash = commonUtils.generateFileHash(file);
      if (createBookDto.title) {
        book.title = createBookDto.title
      }
      if (createBookDto.author) {
        book.author = createBookDto.author;
      }
      if (createBookDto.description) {
        book.description = createBookDto.description;
      }

      book.filePath = file.path;
      book.fileSize = file.size;
      book.fileType = file.mimetype;
      book.fileHash = fileHash;

      const updatedBook = await book.save();
      const updateBookResponse: BookResponse = {
        id: updatedBook._id.toString(),
        title: updatedBook.title,
        author: updatedBook.author,
        description: updatedBook.description,
        filetype: updatedBook.fileType,
        createdAt: updatedBook.createdAt,
        updatedAt: updatedBook.updatedAt
      }
      return updateBookResponse;
    }
    catch (error) {
      throw new BadRequestException("Failed to update the book file");
    }
  }
  //function to delete book
  async deleteBook(bookId: string) {
    const book = await this.booksModel.findById(bookId);
    if (!book) {
      throw new BadRequestException("book is not found");
    }
    //remove the file from storage
    if (book.filePath && fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }
    //remove the book from database
    const deletedBook = await this.booksModel.findByIdAndDelete(bookId);
    if (!deletedBook) {
      throw new BadRequestException("failed to delete the book");
    } else {
      return {
        message: "book deleted successfully"
      };
    }
  }
  // Search function with validation
  async searchBook(key: string): Promise<BooksSchema[]> {
    // ✅ Validation: key must exist and be a non-empty string
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new BadRequestException('Search key must be a non-empty string');
    }

    key = key.trim();

    const books = await this.booksModel.find({
      $or: [
        { title: { $regex: key, $options: 'i' } },
        { author: { $regex: key, $options: 'i' } },
        { originalFileName: { $regex: key, $options: 'i' } },
      ],
    });
    if (!books || books.length === 0) {
      throw new NotFoundException('No books found for this key');
    }
    const booksResponse: BookResponse[] = books.map((books) => {
      return {
        id: books._id.toString(),
        title: books.title,
        author: books.author,
        description: books.description,
        category: books.category,
        filePath: books.filePath,
        fileSize: books.fileSize,
        filetype: books.fileType,
        updatedAt: books.updatedAt,
        readUrl: `http://localhost:3000/books/read/${books._id}`, // dynamic read link
        downloadUrl: `http://localhost:3000/books/download/${books._id}`, // dynamic download link
      };
    });
    return booksResponse;
  }
  //get book by id
  async getBookById(id: string) {
    const book = await this.booksModel.findById(id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }
  async createCategory(categoryDto:CreateCategoryDto){
   //check if category exists
   const existingCategory = await this.categoryModel.findOne({name:categoryDto.name})
   if(existingCategory){
    throw new BadRequestException("category already exists");
   }

   const newCategory = new this.categoryModel({
     name:categoryDto.name,
     description:categoryDto.description
   });
   const savedCategory = await newCategory.save();
   return{
    id:savedCategory._id.toString(),
    name:savedCategory.name,
    description:savedCategory.description,
    createdAt:savedCategory.createdAt,
    updatedAt:savedCategory.updatedAt 
   }
  }

  async getAllCategories(){
    const categories = await this.categoryModel.find();
    //check if categories found 
    if(!categories || categories.length===0){
      throw new NotFoundException("no categories found");
    }
    const categoriesResponse:CategoryResponse[] = categories.map((category)=>{
      return {
        id:category._id.toString(),
        name:category.name,
        description:category.description,
        updatedAt:category.updatedAt
      }
    });
    return categoriesResponse;
  }
}

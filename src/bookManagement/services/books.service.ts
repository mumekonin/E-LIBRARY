import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { BooksSchema, CategorySchema } from "../schemas/books.schema";
import { CreateBookDto, CreateCategoryDto, updateBookDto } from "../dtos/books.dto";
import { BookResponse, CategoryResponse } from "../responses/books.response";
import { InjectModel } from "@nestjs/mongoose";
import { commonUtils } from "src/commons/utils";
import * as fs from 'fs';
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(BooksSchema.name)
    private readonly booksModel: Model<BooksSchema>,
    @InjectModel(CategorySchema.name)
    private readonly categoryModel:Model<CategorySchema>
    //private readonly commonUtiles:commonUtils
  ) { }
// books.service.ts
async createBook(createBookDto: CreateBookDto, bookFile: Express.Multer.File, coverFile?: Express.Multer.File) {
  
  // Normalize paths: replace backslashes with forward slashes
  const normalizedFilePath = bookFile?.path ? bookFile.path.replace(/\\/g, '/') : null;
  
  // Adding the leading slash ensures the browser treats it as a root-relative path
  const normalizedCoverPath = coverFile?.path ? `/${coverFile.path.replace(/\\/g, '/')}` : null;

  const newBook = new this.booksModel({ 
    ...createBookDto,
    category: createBookDto.category,
    filePath: normalizedFilePath,
    fileType: bookFile.mimetype,
    fileSize: bookFile.size,
    fileHash: commonUtils.generateFileHash(bookFile),

    coverPath: normalizedCoverPath, 
    coverType: coverFile?.mimetype || null,
    coverSize: coverFile?.size || 0,
  });

  const saveBooks = await newBook.save();
  
  return {
    id: saveBooks._id.toString(),
    title: saveBooks.title,
    author: saveBooks.author,
    description: saveBooks.description,
    category: saveBooks.category,
    filetype: saveBooks.fileType,
    createdAt: saveBooks.createdAt,
    updatedAt: saveBooks.updatedAt,
    coverPath: saveBooks.coverPath,
    coverType: saveBooks.coverType,
  };
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
        category: books.category,
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
      category: bookToBeFind.category,
      filetype: bookToBeFind.fileType,
      createdAt: bookToBeFind.createdAt,
      updatedAt: bookToBeFind.updatedAt
    }
    return bookDetailResponse;
  }
  //updateBook
  async updateBookFile(bookId: string, updateBookDto: updateBookDto, file: Express.Multer.File) {
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
      if (updateBookDto.title) {
        book.title = updateBookDto.title
      }
      if (updateBookDto.author) {
        book.author = updateBookDto.author;
      }
      if (updateBookDto.description) {
        book.description = updateBookDto.description;
      }

      book.filePath = file?.path;
      book.fileSize = file?.size;
      book.fileType = file?.mimetype;
      book.fileHash = fileHash;

      const updatedBook = await book.save();
      const updateBookResponse: BookResponse = {
        id: updatedBook._id.toString(),
        title: updatedBook.title,
        author: updatedBook.author,
        category: updatedBook.category,
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
        coverPath:books.coverPath,
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
async createCategory(categoryDto: CreateCategoryDto) {
  // 1. Correct the logic: Throw error IF existingCategory is FOUND
  const existingCategory = await this.categoryModel.findOne({ name: categoryDto.name });
  
  if (existingCategory) {
    throw new BadRequestException("Category already exists");
  }

  // 2. Use .create() for a cleaner approach
  const savedCategory = await this.categoryModel.create({
    name: categoryDto.name,
    description: categoryDto.description
  });

  // 3. Return the mapped object
  return {
    id: savedCategory._id.toString(),
    name: savedCategory.name,
    description: savedCategory.description
  };
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
        description:category.description
      }
    });
    return categoriesResponse;
  }
 async findTopSix() {
  const books = await this.booksModel.find().select('+coverPath').limit(6).exec();
     console.log()
  return books.map((book) => ({
     message:"urlis", url:book.coverPath,
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    description: book.description,
    category: book.category,
    coverPath:book.coverPath, 
    readUrl: `http://localhost:3000/books/read/${book._id}`,
    downloadUrl: `http://localhost:3000/books/download/${book._id}`,
  }));
}
  async findOne(id: string): Promise<BooksSchema> {
    const book = await this.booksModel.findById(id).exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }
}

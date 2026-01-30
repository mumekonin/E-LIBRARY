import { Body, Controller, Post, Get, UseInterceptors, UploadedFile, Param, Put, Delete, Query, NotFoundException, Res } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto, CreateCategoryDto } from "../dtos/books.dto";
import * as path from 'path';
import { UploadFileInterceptor } from "uploads/upload.interceptor";
import type { Response } from 'express';
import * as fs from 'fs';
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService
  ) { }
  private readonly uploadDir = path.join(__dirname, '../../../uploads/Uploads');
  //interceptor for file upload
  @UseInterceptors(UploadFileInterceptor())
  @Post('Upload-book')
  async uploadBook(@Body() createBookDto: CreateBookDto, @UploadedFile() file: Express.Multer.File) {

    const result = await this.booksService.createBook(createBookDto, file);
    return result;
  }
  //get all books
  @Get("get-all-books")
  async getAllBooks() {
    const result = await this.booksService.getAllBooks();
    return result
  }
  //get book detail
  @Get("getBookDetail/:id")
  async getBook(@Param('id') id: string) {
    return this.booksService.getBookDetail(id);
  }
  //interceptor for file upload
  @UseInterceptors(UploadFileInterceptor())
  //update book
  @Put('update-book/:id')
  async updateBook(@Param('id') id: string, @Body() createBookDto: CreateBookDto, @UploadedFile() file: Express.Multer.File) {
    const result = await this.booksService.updateBookFile(id, createBookDto, file);
    return result;
  }
  //delete book
  @Delete('delete-book/:id')
  async deleteBook(@Param('id') id: string) {
    const result = await this.booksService.deleteBook(id);
    return result;
  }
  //search book
  @Get('search-books')
  async searchBooks(@Query('key') key: string) {
    const books = await this.booksService.searchBook(key.trim());
    return books;
  }
  //download book
  @Get('download/:id')
  async downloadBook(@Param('id') id: string, @Res() res: Response) {
    //find the book data by id
    const book = await this.booksService.getBookById(id);
    //create the file path
    if (!book.filePath) {
      throw new NotFoundException('File path not found');
    }
    //! Convert stored path into an absolute path
    const filePath = path.resolve(book.filePath);
    //check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }
    // Send file and force browser download
    return res.sendFile(filePath, {
      headers: {
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
      },
    });
  }
  //read book
  @Get('read/:id')
  async readBook(@Param('id') id: string, @Res() res: Response) {
    const book = await this.booksService.getBookById(id)
    //create the file path
    if (!book.filePath) {
      throw new NotFoundException('File path not found');
    }
    //! Convert stored path into an absolute path
    const filePath = path.resolve(book.filePath);
    //check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }
    return res.sendFile(filePath, {
      headers: { 'Content-Disposition': 'inline' },
    });
  }
  @Post('Create-category')
  async createCategory(@Body()createCategoryDto:CreateCategoryDto){
    const result = await this.booksService.createCategory(createCategoryDto);
    return result;
  }
  @Get('get-all-categories')
  async getAllCategories(){
    const result = await this.booksService.getAllCategories();
    return result;
  }
}
import { Body, Controller, Post, Get, UseInterceptors, UploadedFile, Param, Put, Delete, Query, NotFoundException, Res, UseGuards, BadRequestException, UploadedFiles } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto, CreateCategoryDto, updateBookDto } from "../dtos/books.dto";
import * as path from 'path';
import { UploadFileInterceptor } from "uploads/upload.interceptor";
import type { Response } from 'express';
import * as fs from 'fs';
import { Role } from "src/commons/enums/roles.enum";
import { Roles } from "src/commons/decorators/roles.decorator";
import { DbRolesGuard } from "src/commons/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/commons/guards/jwtauth.gourd";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "uploads/multer.config";
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService
  ) { }
  private readonly uploadDir = path.join(__dirname, '../../../uploads/Uploads');
  //interceptor for file upload 
@Post('upload')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'book', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ],
    multerConfig, // <--- CRITICAL: This enables Disk Storage so .path exists
  ),
)
async uploadBook(
  @UploadedFiles() files: { book?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  @Body() createBookDto: CreateBookDto,
) {
  // 1. TypeScript Guard (Fixes TS18048 'possibly undefined')
  if (!files?.book || files.book.length === 0) {
    throw new BadRequestException('Book file is required');
  }
  // 2. Extract the single file objects from the arrays
  const bookFile = files.book[0];
  const coverFile = files.cover?.[0]; // This will now have a .path property
  // 3. Call your service using your exact format
  return this.booksService.createBook(createBookDto, bookFile, coverFile);
}
  @Get("get-all-books")
  @UseGuards(AuthGuard('jwt'),DbRolesGuard)
  @Roles(Role.LIBRARIAN , Role.ADMIN)
  async getAllBooks() {
    const result = await this.booksService.getAllBooks();
    return result
  }
  //get book detail
  @JwtAuthGuard()
  @Get("getBookDetail/:id")
  async getBook(@Param('id') id: string) {
    return this.booksService.getBookDetail(id);
  }
  //interceptor for file upload
  @UseInterceptors(UploadFileInterceptor())
  @Put('update-book/:id')
  @UseGuards(AuthGuard('jwt'),DbRolesGuard)
  @Roles(Role.LIBRARIAN)
  async updateBook(@Param('id') id: string, @Body() updateBookDto: updateBookDto, @UploadedFile() file: Express.Multer.File) {
    const result = await this.booksService.updateBookFile(id, updateBookDto,file);
    return result;
  }
  //delete book
   @Delete('delete-book/:id')
   @UseGuards(AuthGuard('jwt'),DbRolesGuard)
   @Roles(Role.LIBRARIAN)
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
  @UseGuards(AuthGuard('jwt'),DbRolesGuard)
  @Roles(Role.LIBRARIAN)
  async createCategory(@Body() createCategoryDto:CreateCategoryDto){
    const result = await this.booksService.createCategory(createCategoryDto);
    return result;
  }
  @Get('get-all-categories')
  async getAllCategories(){
    const result = await this.booksService.getAllCategories();
    return result;
  }
  @Get('getAllBooks')
  async getAllBook() {
    return await this.booksService.findTopSix();
  }
  // Secure download route
  @Get('download/:id')
  async downloadBooks(@Param('id') id: string, @Res() res: Response) {
    const book = await this.booksService.findOne(id);
    return res.download(`./uploads/${book.filePath}`);
  }
}

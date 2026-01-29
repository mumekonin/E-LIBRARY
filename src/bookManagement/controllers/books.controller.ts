import { Body, Controller, Post,Get ,UseInterceptors, UploadedFile, Param, Put } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto } from "../dtos/books.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { extname } from "path";
import { UploadFileInterceptor } from "uploads/upload.interceptor";
@Controller('books')
export class BooksController {
constructor(
     private readonly booksService:BooksService
) {}
//interceptor for file upload
@UseInterceptors(UploadFileInterceptor())
 @Post ('Upload-book')
  async uploadBook(@Body() createBookDto:CreateBookDto , @UploadedFile() file: Express.Multer.File){
    
    const result = await this.booksService.createBook(createBookDto, file);
    return result;
  }
  @Get("get-all-books")
  async getAllBooks(){
    const result = await this.booksService.getAllBooks();
    return result
  }
  @Get("getBookDetail/:id")
  async getBook(@Param('id') id: string) {
  return this.booksService.getBookDetail(id);
  }
  //interceptor for file upload
  @UseInterceptors(UploadFileInterceptor())
  @Put('update-book/:id')
  async updateBook(@Param('id') id:string,@Body() createBookDto:CreateBookDto,@UploadedFile() file: Express.Multer.File){
    const result = await this.booksService.updateBookFile(id,createBookDto,file);
    return result;
  }
}
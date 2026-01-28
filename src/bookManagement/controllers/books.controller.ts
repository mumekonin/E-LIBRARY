import { Body, Controller, Post, UseInterceptors, UploadedFile } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto } from "../dtos/books.dto";
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('books')
export class BooksController {
constructor(
     private readonly booksService:BooksService
) {}
@UseInterceptors(FileInterceptor('file'))
 @Post ('Upload-book')
  async uploadBook(@Body() createBookDto:CreateBookDto , @UploadedFile() file: Express.Multer.File){
    
    const result = await this.booksService.createBook(createBookDto, file);
    return result;
  }
}
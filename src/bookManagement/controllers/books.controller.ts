import { Body, Controller, Post, Req, UploadedFile } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto } from "../dtos/books.dto";

@Controller('books')
export class BooksController {
constructor(
     private readonly booksService:BooksService
) {}
 @Post('Uplobookad-')
  async uploadBook(@Body() createBookDto:CreateBookDto,@UploadedFile() file: Express.Multer.File){
    
    const result = await this.booksService.createBook(createBookDto, file);
    return result;
  }
}
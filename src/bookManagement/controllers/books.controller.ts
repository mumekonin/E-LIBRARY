import { Body, Controller, Post,Get ,UseInterceptors, UploadedFile, Param } from "@nestjs/common";
import { BooksService } from "../services/books.service";
import { CreateBookDto } from "../dtos/books.dto";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { extname } from "path";
@Controller('books')
export class BooksController {
constructor(
     private readonly booksService:BooksService
) {}
@UseInterceptors(
    FileInterceptor('file', {
      storage:diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
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
}
import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { BookCatalogService } from "../service/access.service";
import { BookCatalogDto } from "../dtos/accessManagement.dto";
import { JwtAuthGuard } from "src/commons/guards/jwtauth.gourd";

@Controller("book-catalog")
export class BookCatalogController{
  constructor(
    private readonly bookCatalogService:BookCatalogService
  ){}
  @JwtAuthGuard()
  @Post('create-catalog')
  async createBookCatalog(@Body()bookCatalogDto:BookCatalogDto, @Req() req: any){
    const currentUser =req.user;
    const result = await this.bookCatalogService.createBookCatalog(bookCatalogDto,currentUser); 
    return result; 
  }
  //search book by title or author
   @Get('search-books')
    async searchBooks(@Query('key') key: string) {
      const books = await this.bookCatalogService.searchBook(key.trim());
      return books;
    }
}
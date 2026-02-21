import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { BookCatalogService } from "../service/access.service";
import { BookCatalogDto } from "../dtos/accessManagement.dto";
import { JwtAuthGuard } from "src/commons/guards/jwtauth.gourd";

@Controller("book-catalog")
export class BookCatalogController {
  constructor(
    private readonly bookCatalogService: BookCatalogService
  ) { }
  @JwtAuthGuard()
  @Post('create-catalog')
  async createBookCatalog(@Body() bookCatalogDto: BookCatalogDto, @Req() req: any) {
    const currentUser = req.user;
    const result = await this.bookCatalogService.createBookCatalog(bookCatalogDto, currentUser);
    return result;
  }
  //search book by title or author
  @Get('search-books')
  async searchBooks(@Query('key') key: string) {
    const books = await this.bookCatalogService.searchBook(key.trim());
    return books;
  }
  //borrow book
  @JwtAuthGuard()
  @Post('borrow-book/:bookCatalogId')
  async borrowBook(@Req() req: any, @Param('bookCatalogId') bookCatalogId: string, @Body('returnDate') returnDate?: string) {
    let expectedReturnDate: Date | undefined;

    if (returnDate) {
      expectedReturnDate = new Date(returnDate);
      if (isNaN(expectedReturnDate.getTime())) {
        throw new BadRequestException('Invalid return date format');
      }
    }
    const currentUser = req.user;
    const result = await this.bookCatalogService.borrowBook(currentUser, bookCatalogId, expectedReturnDate);
    return result;
  }
  @JwtAuthGuard()
  @Post('return-book/:borrowId')
  async returnBook(@Req() req: any, @Param('borrowId') borrowId: string) {
    const currentUser = req.user;
    const result = await this.bookCatalogService.returnBook(currentUser, borrowId);
    return result;
  }
  @Get('my-active-loans')
  @JwtAuthGuard()
  async getMyLoans(@Req() req: any) {
    const userId = req.user.userId;
    return this.bookCatalogService.findActiveBorrowsByUser(userId);
  }
}
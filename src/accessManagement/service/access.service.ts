import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BookCatalog, Borrow, borrowSchema } from "../schema/access.schema";
import { Model } from "mongoose";
import { BookCatalogDto } from "../dtos/accessManagement.dto";
import { UsersSchema } from "src/users/schema/users.schema";
import { BookCatalogResponse, BorrowResponse } from "../responses/bookCatalogReponse.response";
@Injectable()
export class BookCatalogService {
  constructor(
    @InjectModel(BookCatalog.name)
    private readonly bookCatalogModel: Model<BookCatalog>,
    @InjectModel(UsersSchema.name)
    private readonly userModel: Model<UsersSchema>,
    @InjectModel(Borrow.name)
    private readonly borrowModel: Model<Borrow>,
  ) { }
  async createBookCatalog(bookCatalogDto: BookCatalogDto, currentUser) {
    //check if the user exists
    const user = await this.userModel.findById(currentUser.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role !== 'librarian') {
      throw new BadRequestException('only librarian can add books to catalog');
    }
    const totalCopies = bookCatalogDto.totalCopies;
    if (totalCopies < 1) {
      throw new BadRequestException('total copies must be at least 1');
    }
    const newBook = new this.bookCatalogModel({
      title: bookCatalogDto.title,
      author: bookCatalogDto.author,
      category: bookCatalogDto.category,
      floorNumber: bookCatalogDto.floorNumber,
      section: bookCatalogDto.section,
      shelfNumber: bookCatalogDto.shelfNumber,
      totalCopies: bookCatalogDto.totalCopies,
      availableCopies: totalCopies
    })
    const savedBook = await newBook.save();
    return {
      message: 'book added successfully',
      book: savedBook
    }
  }
  //search book by title or author
  async searchBook(key: string): Promise<BookCatalog[]> {
    // ✅ Validation: key must exist and be a non-empty string
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new BadRequestException('Search key must be a non-empty string');
    }
    key = key.trim();
    const books = await this.bookCatalogModel.find({
      $or: [
        { title: { $regex: key, $options: 'i' } },
        { author: { $regex: key, $options: 'i' } },
        { originalFileName: { $regex: key, $options: 'i' } },
      ],
    });
    if (!books || books.length === 0) {
      throw new NotFoundException('No books found for this key');
    }
    const booksResponse: BookCatalogResponse[] = books.map((books) => {
      return {
        id: books._id.toString(),
        title: books.title,
        author: books.author,
        category: books.category,
        floorNumber: books.floorNumber,
        section: books.section,
        shelfNumber: books.shelfNumber,
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies
        // readUrl: `http://localhost:3000/books/read/${books._id}`, // dynamic read link
        // downloadUrl: `http://localhost:3000/books/download/${books._id}`, // dynamic download link
      };
    });
    return booksResponse;
  }
  async borrowBook(currentUser, bookCatalogId: string, returnDate?: Date) {
    //check is the role is student
    const user = await this.userModel.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('Only students can borrow books');
    }
    //check if the book exists
    const book = await this.bookCatalogModel.findById(bookCatalogId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.availableCopies < 1) {
      throw new BadRequestException('No available copies to borrow');
    }
  if (!returnDate) {
    throw new BadRequestException('Return date is required');
  }
  if (isNaN(returnDate.getTime())) {
    throw new BadRequestException('Invalid return date format');
  }
    //create a borrow record
    const newBorrow = new this.borrowModel({
      userId: currentUser.userId,
      bookCatalogId: bookCatalogId,
      borrowDate: new Date().toISOString().split('T')[0],
      returnDate: returnDate
    });
    await newBorrow.save();
    //decrement available copies
    book.availableCopies -= 1;
    await book.save();
    const borrowResponse: BorrowResponse = {
      firstName: user.firstName,
      lastName: user.lastName,
      bookTitle: book.title,
      borrowDate: newBorrow.borrowDate,
      returnDate: newBorrow.returnDate
    }
    return {
      message: 'Book borrowed successfully',
      borrowDetails: borrowResponse
    };
  }
  async returnBook(currentUser, borrowId: string) {
    //check if the borrow record exists
    const borrowRecord = await this.borrowModel.findById(borrowId.toString());
    if (!borrowRecord) {
      throw new NotFoundException('Borrow record not found');
    }

    //check if the borrow record belongs to the current user
    if (borrowRecord.userId.toString() !== currentUser.userId) {
      throw new BadRequestException('You can only return your own borrowed books');
    }
    //delete borrow record
    const deletedBorrow = await this.borrowModel.findByIdAndDelete(borrowId);
    if (!deletedBorrow) {
      throw new BadRequestException('Failed to return the book');
    }
    //increment available copies
    const book = await this.bookCatalogModel.findById(deletedBorrow.bookCatalogId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
    return {
      message: 'Book returned successfully'
    };
  }
}
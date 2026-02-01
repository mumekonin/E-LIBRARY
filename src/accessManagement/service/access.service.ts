import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BookCatalog } from "../schema/access.schema";
import { Model } from "mongoose";
import { BookCatalogDto } from "../dtos/accessManagement.dto";
import { UsersSchema } from "src/users/schema/users.schema";
import { BookCatalogResponse } from "../responses/bookCatalogReponse.response";
@Injectable()
export class BookCatalogService{
  constructor(
    @InjectModel(BookCatalog.name)
        private readonly bookCatalogModel: Model<BookCatalog>,
    @InjectModel(UsersSchema.name)
        private readonly userModel: Model<UsersSchema>
  ){}
    async createBookCatalog(bookCatalogDto:BookCatalogDto,currentUser){
        //check if the user exists
        const user =  await this.userModel.findById(currentUser.userId);
        if(!user){
          throw new BadRequestException('User not found');
        }
        if(user.role !=='librarian'){
          throw new BadRequestException('only librarian can add books to catalog');
        }
        const totalCopies = bookCatalogDto.totalCopies;
        if(totalCopies < 1){
          throw new BadRequestException('total copies must be at least 1');
        }
        const newBook =  new this.bookCatalogModel({
            title: bookCatalogDto.title,
            author: bookCatalogDto.author,
            category: bookCatalogDto.category,
            floorNumber: bookCatalogDto.floorNumber,
            section: bookCatalogDto.section,
            shelfNumber: bookCatalogDto.shelfNumber,
            totalCopies: bookCatalogDto.totalCopies,
            availableCopies:totalCopies
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
    ascync 
}
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BookCatalog } from "../schema/access.schema";
import { Model } from "mongoose";
import { BookCatalogDto } from "../dtos/accessManagement.dto";
import { UsersSchema } from "src/users/schema/users.schema";
@Injectable()
export class BookCatalogService{
  constructor(
    @InjectModel(BookCatalog.name)
        private readonly bookCatalogModel: Model<BookCatalog>,
    @InjectModel(UsersSchema.name)
        private readonly userModel: Model<UsersSchema>
  ){}
    async createBookCatalog(bookCatalogDto:BookCatalogDto,currentUser:any){
        //check if the user exists
        const user =  await this.userModel.findById(currentUser);if(!user){
          throw new BadRequestException('User not found');
        }
        if(user.role !=='librarian'){
          throw new BadRequestException('only librarian can add books to catalog');
        }

        const newBook =  new this.bookCatalogModel({
            ...bookCatalogDto
        })
        const savedBook = await newBook.save();

        return {
          message: 'book added successfully',
          book: savedBook
        }
    }
}
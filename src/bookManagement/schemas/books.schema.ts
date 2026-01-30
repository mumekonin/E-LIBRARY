import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class BooksSchema {
  @Prop()
  title: string;
  @Prop()
  author: string;
  @Prop()
  description: string;

  @Prop() // reference Category
  category:string;

  // where the file is stored
  @Prop()
  filePath?: string;
  @Prop()
  fileType?: string; // pdf, epub
  @Prop()
  fileSize?: number; // bytes
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
  @Prop()
  fileHash?: string;
  @Prop()
  downloadUrl?: string;
  @Prop()
  readUrl?: string;
}
export const bookSchema = SchemaFactory.createForClass(BooksSchema);
export class CatagorySchema {
  @Prop()
  name:string;
  @Prop()
  description: string;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
} export const catagorySchema = SchemaFactory.createForClass(CatagorySchema);
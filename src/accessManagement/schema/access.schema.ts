import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class BookCatalog {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  author: string;
  @Prop()
  category: string;
  @Prop({ required: true })
  floorNumber: number;
  @Prop({ required: true })
  section: string;
  @Prop({ required: true })
  shelfNumber: string;
  @Prop({ default: true })
  isAvailable: boolean;
}
export const bookCatalogSchema = SchemaFactory.createForClass(BookCatalog);

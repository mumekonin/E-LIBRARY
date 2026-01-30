export class BookResponse {
  id: string;
  title: string;
  author: string;
  description: string;
  filetype?: string;
  createdAt?: Date;
  updatedAt?: Date;
  sendFile?: string;
  readUrl?: string;
  downloadUrl?: string;
}
export class CategoryResponse {
  id: string
  name: string;
  description: string
  updatedAt?: Date;
}
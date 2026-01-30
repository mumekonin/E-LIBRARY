export class BookResponse {
  id: string;
  title: string
  author: string
  description: string
  filetype?: string
  createdAt?: Date
  updatedAt?: Date
  sendFile?: string
  downloadUrl?: string
}
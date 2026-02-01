export class BookCatalogResponse {
    title: string;
    author: string;
    category: string;
    floorNumber: number;
    section: string;
    shelfNumber: string;
    totalCopies?: number;
    availableCopies?: number;
}
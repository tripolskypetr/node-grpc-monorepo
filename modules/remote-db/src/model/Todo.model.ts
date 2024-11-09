import { Models } from "node-appwrite";

export interface ITodoDto {
    title: string;
    completed: boolean;
}

export interface ITodoDocument extends Models.Document, ITodoDto {
}

export interface ITodoRow extends ITodoDocument {
    id: string;
}

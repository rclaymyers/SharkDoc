import Database from "better-sqlite3";
import path from "path";
import { Queries } from "./constants";
import { Gallery } from "../sharedModels/Gallery";
import { MarkdownDocument } from "../sharedModels/MarkdownDocument";

const dbPath = path.resolve(__dirname, "data.sqlite");
const db = new Database(dbPath);

export const initDatabase = () => {
  db.prepare(Queries.CreateGalleriesTableIfNotExists).run();
  db.prepare(Queries.CreateImagesTableIfNotExists).run();
};

export const createOrUpdateGallery = (gallery: Gallery) => {};

export const createOrUpdateMarkdownDocument = (
  markdownDocument: MarkdownDocument
) => {};

import Database from "better-sqlite3";
import path from "path";
import { Queries } from "./constants";
import { Gallery, GalleryCreationRequest } from "../sharedModels/Gallery";
import {
  MarkdownDocument,
  MarkdownDocumentCreationRequest,
  MarkdownDocumentPage,
} from "../sharedModels/MarkdownDocument";

const dbPath = path.resolve(__dirname, "data.sqlite");
const db = new Database(dbPath);

export const initDatabase = () => {
  db.prepare(Queries.CreateMarkdownDocumentsTableIfNotExists).run();
  db.prepare(Queries.CreatePagesTableIfNotExists).run();
  db.prepare(Queries.CreateGalleriesTableIfNotExists).run();
  db.prepare(Queries.CreateImagesTableIfNotExists).run();
};

export const createOrUpdateGallery = (
  galleryRequest: Gallery | GalleryCreationRequest
): Gallery => {
  let galleryId: number | null = null;
  if (Gallery.IsGallery(galleryRequest)) {
    db.prepare(Queries.UpdateGallery).run(
      galleryRequest.name,
      galleryRequest.id
    );
    galleryId = galleryRequest.id;
  } else {
    const result = db
      .prepare(Queries.CreateGallery)
      .run(galleryRequest.name, galleryRequest.markdownDocumentId);
    console.log("Created new gallery");
    galleryId = result.lastInsertRowid as number;
    console.log("Got id:", galleryId);
  }

  return retrieveGalleryWithImages(galleryId);
};

export const createOrUpdateDocument = (
  documentRequest: MarkdownDocument | MarkdownDocumentCreationRequest
): MarkdownDocument => {
  let documentId: number | null = null;
  if (MarkdownDocument.IsMarkdownDocument(documentRequest)) {
    db.prepare(Queries.UpdateMarkdownDocument).run(
      documentRequest.title,
      documentRequest.id
    );
    documentId = documentRequest.id;
  } else {
    const result = db
      .prepare(Queries.CreateMarkdownDocument)
      .run(documentRequest.title);
    documentId = result.lastInsertRowid as number;
    db.prepare(Queries.CreatePage).run(documentId);
  }
  return retrieveMarkdownDocumentWithPagesAndGalleries(documentId);
};

export const createPage = (
  markdownDocumentId: number
): MarkdownDocumentPage => {
  const result = db.prepare(Queries.CreatePage).run("", markdownDocumentId);
  console.log("Created page, result records:", result.changes);
  console.log(
    "Pages for this document:",
    db.prepare(Queries.SelectPagesByMarkdownDocumentId).all(markdownDocumentId)
  );
  return retrievePage(result.lastInsertRowid as number);
};

export const updatePage = (
  page: MarkdownDocumentPage
): MarkdownDocumentPage => {
  db.prepare(Queries.UpdatePage).run(page.content, page.id);
  return retrievePage(page.id);
};

export const retrievePage = (pageId: number): MarkdownDocumentPage => {
  const result = db
    .prepare(Queries.SelectPageByPageId)
    .get(pageId) as unknown as MarkdownDocumentPage;
  return result;
};

export const retrievePagesByDocumentId = (
  markdownDocumentId: number
): MarkdownDocumentPage[] => {
  const result = db
    .prepare(Queries.SelectPagesByMarkdownDocumentId)
    .all(markdownDocumentId) as unknown as MarkdownDocumentPage[];
  return result;
};

export const retrieveGalleryWithImages = (galleryId: number): Gallery => {
  const gallery = selectGallery(galleryId);
  gallery.imagePaths = selectGalleryImages(galleryId).map(
    (imageObject) => imageObject.filename
  );
  return gallery;
};

const selectGallery = (id: number): Gallery => {
  const result = db
    .prepare(Queries.SelectGalleryById)
    .get(id) as unknown as Gallery;
  return new Gallery(result.id, result.name, [], result.markdownDocumentId);
};

export const createImageInGallery = (
  imagePath: string,
  galleryId: number
): void => {
  db.prepare(Queries.InsertImage).run(imagePath, galleryId);
};

const selectMarkdownDocumentGalleries = (
  markdownDocumentId: number
): Gallery[] => {
  const result = db
    .prepare(Queries.SelectGalleriesByMarkdownDocumentId)
    .all(markdownDocumentId) as Gallery[];
  return result;
};

export const retrieveAllMarkdownDocuments = (): MarkdownDocument[] => {
  return db
    .prepare(Queries.SelectAllMarkdownDocuments)
    .all() as unknown as MarkdownDocument[];
};

export const retrieveMarkdownDocumentWithPagesAndGalleries = (
  markdownDocumentId: number
): MarkdownDocument => {
  const document = db
    .prepare(Queries.SelectMarkdownDocumentById)
    .get(markdownDocumentId) as unknown as MarkdownDocument;
  console.log("Got document:", document);
  const galleries: Gallery[] =
    selectMarkdownDocumentGalleries(markdownDocumentId);
  galleries.forEach((gallery: Gallery) => {
    gallery.imagePaths = selectGalleryImages(gallery.id).map(
      (image) => image.filename
    );
  });
  const pages: MarkdownDocumentPage[] =
    retrievePagesByDocumentId(markdownDocumentId);
  console.log("Got galleries:", galleries);
  console.log("Got pages:", pages);
  document.galleries = galleries;
  document.pages = pages;
  return document;
};

//todo create type
const selectGalleryImages = (galleryId: number): { filename: string }[] => {
  return db.prepare(Queries.SelectImagesByGalleryId).all(galleryId) as {
    filename: string;
  }[];
};

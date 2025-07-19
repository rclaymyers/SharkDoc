import Database from "better-sqlite3";
import path from "path";
import { Gallery, GalleryCreationRequest } from "../sharedModels/Gallery";
import {
  MarkdownDocument,
  MarkdownDocumentCreationRequest,
  MarkdownDocumentPage,
} from "../sharedModels/MarkdownDocument";
import {
  GalleryQueries,
  ImageQueries,
  MarkdownDocumentPageQueries,
  MarkdownDocumentQueries,
  UserQueries,
} from "./constants/queries";
import { User } from "./auth";

const markdownDocumentQueryResultToProper = (
  result: MarkdownDocumentQueryResult
): MarkdownDocument => ({
  ...result,
  pages: result.pages ?? [],
  galleries: result.galleries ?? [],
});
const galleryQueryResultToProper = (result: GalleryQueryResult): Gallery => ({
  ...result,
  imagePaths: result?.imagePaths ?? [],
  markdownDocumentId: result.markdown_document_id,
});

const isTest = process.env.NODE_ENV === "test";
if (isTest) {
  console.log("======         Test Mode         ======");
  console.log("======     Using in-memory DB    ======");
}
const dbPath = path.resolve(__dirname, "data.sqlite");
const db = new Database(isTest ? ":memory:" : dbPath);

export const initDatabase = () => {
  db.prepare(UserQueries.CreateUsersTableIfNotExists).run();
  db.prepare(
    MarkdownDocumentQueries.CreateMarkdownDocumentsTableIfNotExists
  ).run();
  db.prepare(MarkdownDocumentPageQueries.CreatePagesTableIfNotExists).run();
  db.prepare(GalleryQueries.CreateGalleriesTableIfNotExists).run();
  db.prepare(ImageQueries.CreateImagesTableIfNotExists).run();
};

export const createUser = (username: string, hashedPass: string) => {
  db.prepare(UserQueries.CreateUser).run(username, hashedPass);
};

export const selectUser = (username: string) => {
  return db
    .prepare(UserQueries.SelectUserByUsername)
    .get(username) as unknown as User | undefined;
};

export const createOrUpdateGallery = (
  galleryRequest: Gallery | GalleryCreationRequest
): Gallery => {
  let galleryId: number | null = null;
  if ("id" in galleryRequest) {
    db.prepare(GalleryQueries.UpdateGallery).run(
      galleryRequest.name,
      galleryRequest.id
    );
    galleryId = galleryRequest.id;
  } else {
    const result = db
      .prepare(GalleryQueries.CreateGallery)
      .run(galleryRequest.name, galleryRequest.markdownDocumentId);
    galleryId = result.lastInsertRowid as number;
  }

  return retrieveGalleryWithImages(galleryId);
};

export const deleteGallery = (galleryId: number): void => {
  db.prepare(GalleryQueries.DeleteGallery).run(galleryId);
  return;
};

export const createOrUpdateDocument = (
  documentRequest: MarkdownDocument | MarkdownDocumentCreationRequest,
  ownerId: number,
  shouldCreatePage: boolean
): MarkdownDocument => {
  let documentId: number | null = null;
  if ("id" in documentRequest) {
    db.prepare(MarkdownDocumentQueries.UpdateMarkdownDocument).run(
      documentRequest.title,
      documentRequest.id
    );
    documentId = documentRequest.id;
  } else {
    const result = db
      .prepare(MarkdownDocumentQueries.CreateMarkdownDocument)
      .run(documentRequest.title, ownerId);
    documentId = result.lastInsertRowid as number;
    if (shouldCreatePage) {
      createPage(documentId);
    }
  }
  return retrieveMarkdownDocumentWithPagesAndGalleries(documentId);
};

export const deleteDocument = (markdownDocumentId: number): void => {
  const result = db
    .prepare(MarkdownDocumentQueries.DeleteMarkdownDocument)
    .run(markdownDocumentId);
};

export const createPage = (
  markdownDocumentId: number
): MarkdownDocumentPage => {
  const result = db
    .prepare(MarkdownDocumentPageQueries.CreatePage)
    .run("# New Page", markdownDocumentId);
  return retrievePage(result.lastInsertRowid as number);
};

export const deletePage = (
  documentId: number,
  pageId: number
): MarkdownDocument => {
  const result = db
    .prepare(MarkdownDocumentPageQueries.DeletePageByPageId)
    .run(pageId);
  return retrieveMarkdownDocumentWithPagesAndGalleries(documentId);
};

export const updatePage = (
  page: MarkdownDocumentPage
): MarkdownDocumentPage => {
  db.prepare(MarkdownDocumentPageQueries.UpdatePage).run(page.content, page.id);
  return retrievePage(page.id);
};

export const retrievePage = (pageId: number): MarkdownDocumentPage => {
  const result = db
    .prepare(MarkdownDocumentPageQueries.SelectPageByPageId)
    .get(pageId) as unknown as MarkdownDocumentPage;
  return result;
};

export const retrievePagesByDocumentId = (
  markdownDocumentId: number
): MarkdownDocumentPage[] => {
  const result = db
    .prepare(MarkdownDocumentPageQueries.SelectPagesByMarkdownDocumentId)
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
    .prepare(GalleryQueries.SelectGalleryById)
    .get(id) as GalleryQueryResult;

  return galleryQueryResultToProper(result);
};

export const createImageInGallery = (
  imagePath: string,
  galleryId: number
): void => {
  db.prepare(ImageQueries.InsertImage).run(imagePath, galleryId);
};

export const deleteImage = (imagePath: string): void => {
  db.prepare(ImageQueries.DeleteImage).run(imagePath);
};

type GalleryQueryResult = {
  id: number;
  name: string;
  imagePaths: string[];
  markdown_document_id: number;
};
const selectMarkdownDocumentGalleries = (
  markdownDocumentId: number
): Gallery[] => {
  const result = db
    .prepare(GalleryQueries.SelectGalleriesByMarkdownDocumentId)
    .all(markdownDocumentId) as GalleryQueryResult[];

  return result.map(galleryQueryResultToProper);
};

type MarkdownDocumentQueryResult = {
  id: number;
  ownerId: number;
  title: string;
  pages: MarkdownDocumentPage[] | undefined;
  galleries: Gallery[] | undefined;
};
export const retrieveAllMarkdownDocumentsForUser = (
  userId: number
): MarkdownDocument[] => {
  const queryResults = db
    .prepare(MarkdownDocumentQueries.SelectAllMarkdownDocumentsForUser)
    .all(userId) as unknown as MarkdownDocumentQueryResult[];

  return queryResults.map(markdownDocumentQueryResultToProper);
};

export const retrieveMarkdownDocumentWithPagesAndGalleries = (
  markdownDocumentId: number
): MarkdownDocument => {
  const document = db
    .prepare(MarkdownDocumentQueries.SelectMarkdownDocumentById)
    .get(markdownDocumentId) as unknown as MarkdownDocument;
  const galleries: Gallery[] =
    selectMarkdownDocumentGalleries(markdownDocumentId);
  galleries.forEach((gallery: Gallery) => {
    gallery.imagePaths = selectGalleryImages(gallery.id).map(
      (image) => image.filename
    );
  });
  const pages: MarkdownDocumentPage[] =
    retrievePagesByDocumentId(markdownDocumentId);
  document.galleries = galleries ?? [];
  document.pages = pages ?? [];
  return document;
};

//todo create type
const selectGalleryImages = (galleryId: number): { filename: string }[] => {
  return db.prepare(ImageQueries.SelectImagesByGalleryId).all(galleryId) as {
    filename: string;
  }[];
};

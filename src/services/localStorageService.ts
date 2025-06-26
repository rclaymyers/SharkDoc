import { toRaw } from "vue";
import type { MarkdownDocument } from "../models/MarkdownDocument";
import type { Gallery } from "../models/Gallery";

export const LocalStorageService = {
  saveDocument: (documentToSave: MarkdownDocument): void => {
    const unwrappedDocument = toRaw(documentToSave);
    try {
      const documentsJSON = localStorage.getItem("documents") ?? "[]";
      let documentsArray = JSON.parse(documentsJSON);
      documentsArray = documentsArray.filter(
        (savedDocument: MarkdownDocument) =>
          savedDocument.id !== unwrappedDocument.id
      );
      documentsArray.push(unwrappedDocument);
      const documentsArrayString = JSON.stringify(documentsArray);
      localStorage.setItem("documents", documentsArrayString);
    } catch (e) {
      console.warn("Unable to save document");
      console.error(e);
    }
  },
  loadAllDocuments: (): MarkdownDocument[] => {
    try {
      const documentsString = localStorage.getItem("documents");
      if (!documentsString) {
        return [];
      }
      return JSON.parse(documentsString) as MarkdownDocument[];
    } catch (e) {
      console.warn("Unable to load documents");
      console.error(e);
      return [];
    }
  },
  saveGallery: (gallery: Gallery): void => {
    const unwrappedGallery = toRaw(gallery);
    try {
      const galleriesJson = localStorage.getItem("galleries") ?? "[]";
      let galleriesArray = JSON.parse(galleriesJson);
      galleriesArray = galleriesArray.filter(
        (savedGallery: Gallery) => savedGallery.id !== unwrappedGallery.id
      );
      galleriesArray.push(unwrappedGallery);
      const galleriesArrayString = JSON.stringify(galleriesArray);
      localStorage.setItem("galleries", galleriesArrayString);
    } catch (e) {
      console.warn("Unable to save gallery");
      console.error(e);
    }
  },
};

import { toRaw } from "vue";
import type { MarkdownDocument } from "../models/MarkdownDocument";

export const LocalStorageService = {
  saveDocument: (documentToSave: MarkdownDocument): void => {
    const unwrappedDocument = toRaw(documentToSave);
    try {
      const documentsJSON = localStorage.getItem("documents") ?? "[]";
      let documentsArray = JSON.parse(documentsJSON);
      console.log("Documents array:", documentsArray);
      documentsArray = documentsArray.filter(
        (savedDocument: MarkdownDocument) =>
          savedDocument.id !== unwrappedDocument.id
      );
      documentsArray.push(unwrappedDocument);
      console.log("Array after pushing document:", unwrappedDocument);
      const documentsArrayString = JSON.stringify(documentsArray);
      console.log("Documents array string:", documentsArrayString);
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
};

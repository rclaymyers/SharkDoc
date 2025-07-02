import type { Gallery } from "./Gallery";

export class MarkdownDocument {
  public id: number;
  public title: string;
  public pages: MarkdownDocumentPage[];
  public galleries: Gallery[];
  public ownerId: number;

  constructor(
    id: number,
    title: string,
    pages: MarkdownDocumentPage[],
    galleries: Gallery[],
    ownerId: number
  ) {
    this.id = id;
    this.title = title;
    this.pages = pages;
    this.galleries = galleries;
    this.ownerId = ownerId;
  }

  static IsMarkdownDocument(instance: any): instance is MarkdownDocument {
    return Object.keys(instance).includes("id");
  }
}

export class MarkdownDocumentCreationRequest {
  public title: string;
  constructor(title: string) {
    this.title = title;
  }
}

export class MarkdownDocumentPage {
  public id: number;
  public content: string;
  constructor(id: number, content: string) {
    this.id = id;
    this.content = content;
  }
}

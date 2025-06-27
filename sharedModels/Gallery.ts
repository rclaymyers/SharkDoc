export class Gallery {
  public id: number;
  public name: string;
  public imagePaths: string[];
  public markdownDocumentId: number;
  constructor(
    id: number,
    name: string,
    imagePaths: string[],
    markdownDocumentId: number
  ) {
    this.id = id;
    this.name = name;
    this.imagePaths = imagePaths;
    this.markdownDocumentId = markdownDocumentId;
  }

  static IsGallery(instance: any): instance is Gallery {
    return Object.keys(instance).includes("id");
  }
}

export class GalleryCreationRequest {
  public name: string;
  public markdownDocumentId: number;
  constructor(name: string, markdownDocumentId: number) {
    this.name = name;
    this.markdownDocumentId = markdownDocumentId;
  }
}

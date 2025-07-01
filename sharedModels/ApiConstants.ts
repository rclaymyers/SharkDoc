export const ApiEndpoints = {
  POST: {
    Gallery: "/gallery",
    DeleteGallery: "/gallery/delete",
    Image: "/upload",
    DeleteImage: "/image/delete",
    Document: "/document",
    DeleteDocument: "/document/delete",
    CreatePage: "/page/create",
    UpdatePage: "/page/update",
    DeletePage: "/page/delete",
  },
  GET: {
    Gallery: "/gallery",
    AllDocuments: "/documents/all",
    Document: "/document",
  },
};

export class ApiResponse {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

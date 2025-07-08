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
    RegisterUser: "/user/register",
    LoginUser: "/user/login",
  },
  GET: {
    Gallery: "/gallery",
    AllDocuments: "/documents/all",
    Document: "/document",
  },
};

export const INVALID_CREDENTIALS_MESSAGE = "Credentials invalid";

export class ApiResponse {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export class UserAuthRequest {
  username: string;
  unhashedPass: string;
  constructor(username: string, unhashedPass: string) {
    this.username = username;
    this.unhashedPass = unhashedPass;
  }
}

export class UserSignInResponse {
  token: string;
  username: string;
  constructor(token: string, username: string) {
    this.token = token;
    this.username = username;
  }
}

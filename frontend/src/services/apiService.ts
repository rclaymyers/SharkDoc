import { ApiEndpoints, ApiResponse } from "../../../sharedModels/ApiConstants";
import { Gallery, GalleryCreationRequest } from "../../../sharedModels/Gallery";
import {
  MarkdownDocument,
  MarkdownDocumentPage,
  type MarkdownDocumentCreationRequest,
} from "../../../sharedModels/MarkdownDocument";

type HttpMethod = "POST" | "GET";

class ApiRequest<T> {
  public method: HttpMethod;
  public url: string;
  public body: string | FormData | null = null;
  constructor(method: HttpMethod, url: string) {
    this.method = method;
    this.url = url;
  }

  withJsonBody(objectToStringify: any): ApiRequest<T> {
    try {
      this.body = JSON.stringify(objectToStringify);
    } catch (e) {
      console.log("Unable to stringify object:", objectToStringify);
      console.error(e);
    }
    return this;
  }

  withFormDataBody(formData: FormData): ApiRequest<T> {
    this.body = formData;
    return this;
  }

  execute(): Promise<T | null> {
    console.log("Fetching with body:", this.body);
    const headers: HeadersInit =
      this.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" };
    return fetch(this.url, {
      method: this.method,
      body: this.body,
      headers,
    }).then(async (response: Response) => {
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (e) {
          console.warn("Unable to parse error from failed API call");
          console.error(e);
        }
        console.error("API call failed:", this, error);
        return null;
      }
      //todo validate type
      console.log("Returning response:", response);
      console.log("Unparsed body:", response.body);
      return await response.json();
    });
  }
}

export const ApiService = {
  uploadImageFile: async (
    file: File,
    galleryId: number | null
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    if (galleryId) {
      formData.append("galleryId", `${galleryId}`);
    }
    console.log("Building api request with form data:", formData);
    return new ApiRequest<string>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.Image}`
    )
      .withFormDataBody(formData)
      .execute();
  },
  saveGallery: async (
    gallery: Gallery | GalleryCreationRequest
  ): Promise<Gallery | null> => {
    console.log("Body:", JSON.stringify(gallery));
    return new ApiRequest<Gallery>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.Gallery}`
    )
      .withJsonBody(gallery)
      .execute();
  },
  saveDocument: async (
    document: MarkdownDocument | MarkdownDocumentCreationRequest
  ): Promise<MarkdownDocument | null> => {
    console.log("refactored save document call");
    return new ApiRequest<MarkdownDocument>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.Document}`
    )
      .withJsonBody(document)
      .execute();
  },
  deleteDocument: async (markdownDocumentId: number) => {
    return new ApiRequest<ApiResponse>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.DeleteDocument}?markdownDocumentId=${markdownDocumentId}`
    ).execute();
  },
  createPageAndFetchUpdatedDocument: async (
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    await new ApiRequest<MarkdownDocument>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.CreatePage}?markdownDocumentId=${markdownDocumentId}`
    ).execute();
    return ApiService.fetchMarkdownDocument(markdownDocumentId);
  },
  deletePage: async (
    markdownDocumentId: number,
    pageId: number
  ): Promise<MarkdownDocument | null> => {
    return new ApiRequest<MarkdownDocument>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.DeletePage}?markdownDocumentId=${markdownDocumentId}&markdownPageId=${pageId}`
    ).execute();
  },
  updatePageAndFetchUpdatedDocument: async (
    markdownDocumentPage: MarkdownDocumentPage,
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    await new ApiRequest(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.UpdatePage}`
    )
      .withJsonBody(markdownDocumentPage)
      .execute();
    const updatedDocument =
      await ApiService.fetchMarkdownDocument(markdownDocumentId);
    return updatedDocument;
  },
  fetchGallery: async (galleryId: number): Promise<Gallery | null> => {
    return new ApiRequest<Gallery>(
      "GET",
      `http://localhost:3000${ApiEndpoints.GET.Gallery}?galleryId=${galleryId}`
    ).execute();
  },
  deleteGallery: async (galleryId: number): Promise<string | null> => {
    return new ApiRequest<string>(
      "POST",
      `http://localhost:3000${ApiEndpoints.POST.DeleteGallery}?galleryId=${galleryId}`
    ).execute();
  },
  fetchMarkdownDocument: async (
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    return new ApiRequest<MarkdownDocument>(
      "GET",
      `http://localhost:3000${ApiEndpoints.GET.Document}?id=${markdownDocumentId}`
    ).execute();
  },
  fetchAllMarkdownDocuments: async (): Promise<MarkdownDocument[] | null> => {
    return new ApiRequest<MarkdownDocument[]>(
      "GET",
      `http://localhost:3000${ApiEndpoints.GET.AllDocuments}`
    ).execute();
  },
};

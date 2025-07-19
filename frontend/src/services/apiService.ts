import {
  ApiEndpoints,
  ApiResponse,
  UserAuthRequest,
  UserSignInResponse,
} from "../../../sharedModels/ApiConstants";
import {
  GallerySchema,
  type Gallery,
  type GalleryCreationRequest,
} from "../../../sharedModels/Gallery";
import {
  type MarkdownDocument,
  type MarkdownDocumentPage,
  type MarkdownDocumentCreationRequest,
  MarkdownDocumentSchema,
  MarkdownDocumentArraySchema,
} from "../../../sharedModels/MarkdownDocument";
import { LoadingModalService } from "./loadingModalService";
import { LocalStorageService } from "./localStorageService";
import { ToastService } from "./toastService";
import { UtilitiesService } from "./utils";
import { type ZodSchema } from "zod";

type HttpMethod = "POST" | "GET";

class ApiRequest<T> {
  public method: HttpMethod;
  public url: string;
  public body: string | FormData | null = null;
  public authHeader: string | null = null;
  constructor(method: HttpMethod, url: string) {
    this.method = method;
    this.url = url;
  }

  withJsonBody(objectToStringify: any): ApiRequest<T> {
    try {
      this.body = JSON.stringify(objectToStringify);
    } catch (e) {
      console.warn("Unable to stringify object:", objectToStringify);
      console.error(e);
    }
    return this;
  }

  withFormDataBody(formData: FormData): ApiRequest<T> {
    this.body = formData;
    return this;
  }

  withAuthToken(token: string): ApiRequest<T> {
    this.authHeader = `Bearer ${token}`;
    return this;
  }

  executeWithValidation(schema?: ZodSchema<T>): Promise<T | null> {
    const headers: HeadersInit =
      this.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" };
    if (this.authHeader) {
      headers["authorization"] = this.authHeader;
    }
    return fetch(this.url, {
      method: this.method,
      body: this.body,
      headers,
    })
      .then(async (response: Response) => {
        if (response.status === 413) {
          ToastService.showError("Error", "Image is too large");
          return;
        }
        if (!response.ok) {
          let error;
          try {
            error = await response.json();
          } catch (e) {
            console.warn("Unable to parse error from failed API call");
            console.error(e);
          }
          console.error("API call failed:", this, error);
          ToastService.showError(
            "Error",
            error?.message ?? response?.statusText ?? "Unknown error"
          );
          return null;
        }
        const data = await response.json();
        if (schema) {
          const result = schema.safeParse(data);
          if (!result.success) {
            console.warn("API response body wasn't the expected shape.");
            console.warn(result.error);
            return null;
          }
          return result.data;
        }
        return data;
      })
      .catch((_) => {
        LoadingModalService.updateLoadingModal({ showModal: false });
        return null;
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
    return new ApiRequest<string>(
      "POST",
      UtilitiesService.prependApiDomain(ApiEndpoints.POST.Image)
    )
      .withFormDataBody(formData)
      .executeWithValidation();
  },
  deleteImage: async (imagePath: string): Promise<ApiResponse | null> => {
    return new ApiRequest<ApiResponse>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.DeleteImage)}?filename=${imagePath}`
    ).executeWithValidation();
  },
  saveGallery: async (
    gallery: Gallery | GalleryCreationRequest
  ): Promise<Gallery | null> => {
    return new ApiRequest<Gallery>(
      "POST",
      UtilitiesService.prependApiDomain(ApiEndpoints.POST.Gallery)
    )
      .withJsonBody(gallery)
      .executeWithValidation(GallerySchema);
  },
  saveDocument: async (
    document: MarkdownDocument | MarkdownDocumentCreationRequest
  ): Promise<MarkdownDocument | null> => {
    const token = LocalStorageService.getJwt();
    if (!token) {
      //todo redirect to signin
      return null;
    }
    return new ApiRequest<MarkdownDocument>(
      "POST",
      UtilitiesService.prependApiDomain(ApiEndpoints.POST.Document)
    )
      .withJsonBody(document)
      .withAuthToken(token)
      .executeWithValidation(MarkdownDocumentSchema);
  },
  deleteDocument: async (markdownDocumentId: number) => {
    return new ApiRequest<ApiResponse>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.DeleteDocument)}?markdownDocumentId=${markdownDocumentId}`
    ).executeWithValidation();
  },
  createPageAndFetchUpdatedDocument: async (
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    await new ApiRequest<MarkdownDocument>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.CreatePage)}?markdownDocumentId=${markdownDocumentId}`
    ).executeWithValidation(MarkdownDocumentSchema);
    return ApiService.fetchMarkdownDocument(markdownDocumentId);
  },
  deletePage: async (
    markdownDocumentId: number,
    pageId: number
  ): Promise<MarkdownDocument | null> => {
    return new ApiRequest<MarkdownDocument>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.DeletePage)}?markdownDocumentId=${markdownDocumentId}&markdownPageId=${pageId}`
    ).executeWithValidation(MarkdownDocumentSchema);
  },
  updatePageAndFetchUpdatedDocument: async (
    markdownDocumentPage: MarkdownDocumentPage,
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    await new ApiRequest(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.UpdatePage)}`
    )
      .withJsonBody(markdownDocumentPage)
      .executeWithValidation();
    const updatedDocument =
      await ApiService.fetchMarkdownDocument(markdownDocumentId);
    return updatedDocument;
  },
  fetchGallery: async (galleryId: number): Promise<Gallery | null> => {
    return new ApiRequest<Gallery>(
      "GET",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.GET.Gallery)}?galleryId=${galleryId}`
    ).executeWithValidation(GallerySchema);
  },
  deleteGallery: async (galleryId: number): Promise<string | null> => {
    return new ApiRequest<string>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.DeleteGallery)}?galleryId=${galleryId}`
    ).executeWithValidation();
  },
  fetchMarkdownDocument: async (
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    const token = LocalStorageService.getJwt();
    if (!token) {
      ToastService.showError("Error", "Credentials invalid");
      return null;
    }
    return new ApiRequest<MarkdownDocument>(
      "GET",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.GET.Document)}?id=${markdownDocumentId}`
    )
      .withAuthToken(token)
      .executeWithValidation(MarkdownDocumentSchema);
  },
  fetchAllMarkdownDocuments: async (): Promise<MarkdownDocument[] | null> => {
    const token = LocalStorageService.getJwt();
    if (!token) {
      console.warn("Token not found.");
      return null;
    }
    return new ApiRequest<MarkdownDocument[]>(
      "GET",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.GET.AllDocuments)}`
    )
      .withAuthToken(token)
      .executeWithValidation(MarkdownDocumentArraySchema);
  },
  registerUser: async (
    username: string,
    unhashedPass: string
  ): Promise<ApiResponse | null> => {
    return new ApiRequest<ApiResponse>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.RegisterUser)}`
    )
      .withJsonBody(new UserAuthRequest(username, unhashedPass))
      .executeWithValidation();
  },
  signInUser: async (
    username: string,
    unhashedPass: string
  ): Promise<UserSignInResponse | null> => {
    return new ApiRequest<UserSignInResponse>(
      "POST",
      `${UtilitiesService.prependApiDomain(ApiEndpoints.POST.LoginUser)}`
    )
      .withJsonBody(new UserAuthRequest(username, unhashedPass))
      .executeWithValidation();
  },
};

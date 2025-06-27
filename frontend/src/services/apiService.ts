import { ApiEndpoints } from "../../../sharedModels/ApiEndpoints";
import { Gallery, GalleryCreationRequest } from "../../../sharedModels/Gallery";
import {
  MarkdownDocument,
  type MarkdownDocumentCreationRequest,
} from "../../../sharedModels/MarkdownDocument";

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
    try {
      const response = await fetch(
        `http://localhost:3000${ApiEndpoints.POST.Image}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading image:", errorData);
        return null;
      }
      const data = (await response.json()) as unknown as { imagePath: string };
      if (data.imagePath) {
        return data.imagePath;
      }
      console.error("Response was ok, but didn't include an imagePath");
      return null;
    } catch (e) {
      console.error("Error uploading image:", e);
      return null;
    }
  },
  saveGallery: async (
    gallery: Gallery | GalleryCreationRequest
  ): Promise<Gallery | null> => {
    console.log("Body:", JSON.stringify(gallery));
    const response = await fetch(
      `http://localhost:3000${ApiEndpoints.POST.Gallery}`,
      {
        method: "POST",
        body: JSON.stringify(gallery),
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      response.json().then((error) => {
        console.warn("There was an error saving the gallery:");
        console.error(error);
      });
    }
    const galleryResponseObject = await response.json();
    if (!Gallery.IsGallery(galleryResponseObject)) {
      console.warn(
        "Received an ok response, but the gallery response is missing required data"
      );
      return null;
    } else {
      return galleryResponseObject;
    }
  },
  saveDocument: async (
    document: MarkdownDocument | MarkdownDocumentCreationRequest
  ): Promise<MarkdownDocument | null> => {
    const response = await fetch(
      `http://localhost:3000${ApiEndpoints.POST.Document}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(document),
      }
    );
    if (!response.ok) {
      console.warn("Response not ok");
      const error = response.json();
      console.error(error);
      return null;
    }
    const responseDocument: any = await response.json();
    if (!MarkdownDocument.IsMarkdownDocument(responseDocument)) {
      console.warn("Received invalid markdown document:", document);
      return null;
    } else {
      return responseDocument;
    }
  },
  fetchGallery: async (galleryId: number): Promise<Gallery | null> => {
    const response = await fetch(
      `http://localhost:3000${ApiEndpoints.GET.Gallery}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: galleryId,
        }),
      }
    );
    if (!response.ok) {
      console.warn("Response wasn't ok");
      const error = response.json();
      console.error(error);
      return null;
    }
    const gallery = await response.json();
    return gallery;
  },
  fetchMarkdownDocument: async (
    markdownDocumentId: number
  ): Promise<MarkdownDocument | null> => {
    const response = await fetch(
      `http://localhost:3000${ApiEndpoints.GET.Document}?id=${markdownDocumentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      console.warn("Response wasn't ok");
      const error = await response.json();
      console.error(error);
      return null;
    }
    const markdownDocument = await response.json();
    return markdownDocument;
  },
  fetchAllMarkdownDocuments: async (): Promise<MarkdownDocument[] | null> => {
    const response = await fetch(
      `http://localhost:3000${ApiEndpoints.GET.AllDocuments}`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!response.ok) {
      console.warn("Document list failed");
      const error = response.json();
      console.error(error);
      return null;
    }
    const documentList = await response.json();
    return documentList;
  },
};

import { z } from "zod";

export const GallerySchema = z.object({
  id: z.number(),
  name: z.string(),
  imagePaths: z.array(z.string()),
  markdownDocumentId: z.number(),
});

export const GalleryCreationRequestSchema = z.object({
  name: z.string(),
  markdownDocumentId: z.number(),
});

export type Gallery = z.infer<typeof GallerySchema>;
export type GalleryCreationRequest = z.infer<
  typeof GalleryCreationRequestSchema
>;

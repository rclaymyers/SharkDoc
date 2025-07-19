import { type Gallery, GallerySchema } from "./Gallery";
import { z } from "zod";

export const MarkdownDocumentPageSchema = z.object({
  id: z.number(),
  content: z.string(),
});

export const MarkdownDocumentSchema = z.object({
  id: z.number(),
  title: z.string(),
  pages: z.array(MarkdownDocumentPageSchema),
  galleries: z.array(GallerySchema),
  ownerId: z.number(),
});

export const MarkdownDocumentCreationRequestSchema = z.object({
  title: z.string(),
});

export const MarkdownDocumentArraySchema = z.array(MarkdownDocumentSchema);

export type MarkdownDocumentPage = z.infer<typeof MarkdownDocumentPageSchema>;
export type MarkdownDocument = z.infer<typeof MarkdownDocumentSchema>;
export type MarkdownDocumentCreationRequest = z.infer<
  typeof MarkdownDocumentCreationRequestSchema
>;

export const CreateMarkdownPage = (
  id: number,
  content: string
): MarkdownDocumentPage => {
  return {
    id,
    content,
  };
};
export const CreateMarkdownDocument = (
  id: number,
  title: string,
  pages: MarkdownDocumentPage[],
  galleries: Gallery[],
  ownerId: number
): MarkdownDocument => {
  return {
    id,
    title,
    pages,
    galleries,
    ownerId,
  };
};

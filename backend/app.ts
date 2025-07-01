import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import {
  initDatabase,
  retrieveAllMarkdownDocuments,
  retrieveGalleryWithImages,
  retrieveMarkdownDocumentWithPagesAndGalleries,
  createOrUpdateDocument,
  createOrUpdateGallery,
  createPage,
  createImageInGallery,
  updatePage,
  deletePage,
  deleteGallery,
  deleteDocument,
} from "./dbQueryExecutor";
import { Gallery } from "../sharedModels/Gallery";
import { ApiEndpoints } from "../sharedModels/ApiConstants";
import {
  MarkdownDocument,
  MarkdownDocumentPage,
} from "../sharedModels/MarkdownDocument";
import { SuccessResponse } from "./constants/responseTemplates";

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const imageFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFileFilter });

app.post(
  ApiEndpoints.POST.Image,
  upload.single("image"),
  (req: Request, res: Response) => {
    console.log("Got image upload request");
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const galleryId = req.body.galleryId;
    createImageInGallery(`/images/${req.file.filename}`, galleryId);
    res.status(200).json({
      filename: req.file.filename,
      imagePath: `/images/${req.file.filename}`,
    });
  }
);

app.post(ApiEndpoints.POST.Document, (req: Request, res: Response) => {
  if (!req.body?.title) {
    console.warn("document POST request body invalid");
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const updatedDocument: MarkdownDocument = createOrUpdateDocument(req.body);
  res.status(200).json(updatedDocument);
});

app.post(ApiEndpoints.POST.DeleteDocument, (req: Request, res: Response) => {
  if (!req.query?.markdownDocumentId) {
    res.status(400).json({ error: "Invalid markdown document id" });
    return;
  }
  deleteDocument(+req.query.markdownDocumentId);
  res.status(200).json(SuccessResponse);
});

app.post(ApiEndpoints.POST.Gallery, (req: Request, res: Response) => {
  if (!req.body) {
    console.log("Request has no body");
    res.status(400).json({ error: "No request body" });
    return;
  }
  if (!req.body.name) {
    res.status(400).json({ error: "Invalid name" });
    return;
  }
  const updatedGallery: Gallery = createOrUpdateGallery(req.body);
  res.status(200).json(updatedGallery);
});

app.post(ApiEndpoints.POST.DeleteGallery, (req: Request, res: Response) => {
  if (!req.query?.galleryId) {
    res.status(400).json({ error: "Missing gallery id" });
    return;
  }
  deleteGallery(+req.query.galleryId);
  res.status(200).json("Success");
});

app.post(ApiEndpoints.POST.CreatePage, (req: Request, res: Response) => {
  if (!req.query?.markdownDocumentId) {
    console.log("Page creation request is missing markdown document id");
    res.status(400);
    return;
  }
  const newPage: MarkdownDocumentPage = createPage(
    +req.query.markdownDocumentId
  );
  res.status(200).json(newPage);
});

app.post(ApiEndpoints.POST.DeletePage, (req: Request, res: Response) => {
  if (!req.query?.markdownDocumentId || !req.query?.markdownPageId) {
    res.status(400);
    return;
  }
  const updatedDocument = deletePage(
    +req.query.markdownDocumentId,
    +req.query.markdownPageId
  );
  res.status(200).json(updatedDocument);
});

app.post(ApiEndpoints.POST.UpdatePage, (req: Request, res: Response) => {
  if (req.body?.content === undefined || req.body?.id === undefined) {
    //todo write body validator
    console.warn("Request body invalid:", req.body);
    res.status(400);
    return;
  }
  updatePage(req.body);
  res.status(200).json({ status: "success" });
});

app.get(ApiEndpoints.GET.Gallery, (req: Request, res: Response) => {
  if (!req.query?.galleryId) {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }
  const gallery: Gallery = retrieveGalleryWithImages(+req.query.galleryId);
  res.status(200).json(gallery);
});

app.get(ApiEndpoints.GET.AllDocuments, (_, res: Response) => {
  const markdownDocuments = retrieveAllMarkdownDocuments();
  res.status(200).json(markdownDocuments);
});

app.get(ApiEndpoints.GET.Document, (req: Request, res: Response) => {
  if (!req.query?.id) {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }
  const markdownDocument: MarkdownDocument =
    retrieveMarkdownDocumentWithPagesAndGalleries(+req.query.id);
  console.log("returning document:", markdownDocument);
  res.status(200).json(markdownDocument);
});

app.use("/images", express.static(uploadDir));

initDatabase();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import express, { Express, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import {
  initDatabase,
  retrieveAllMarkdownDocumentsForUser,
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
  deleteImage,
} from "./dbQueryExecutor";
import { Gallery } from "../sharedModels/Gallery";
import { ApiEndpoints } from "../sharedModels/ApiConstants";
import {
  MarkdownDocument,
  MarkdownDocumentPage,
} from "../sharedModels/MarkdownDocument";
import { SuccessResponse as SuccessResponseTemplate } from "./constants/responseTemplates";
import {
  buildTokenVerificationMiddleware,
  CREDENTIAL_VALIDATION_ERROR,
  getTokenFromAuthHeader,
  setupAuthEndpoints,
} from "./auth";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Unable to load JWT secret");
}

const app: Express = express();
app.use(cors());
app.use(express.json());
const port = 3000;

setupAuthEndpoints(app, JWT_SECRET);
const tokenVerificationMiddleware =
  buildTokenVerificationMiddleware(JWT_SECRET);

const uploadDir = path.join(__dirname, "uploads");
const welcomeImageDir = path.join(__dirname, "welcomeImages");

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

app.post(ApiEndpoints.POST.DeleteImage, (req: Request, res: Response) => {
  if (!req.query?.filename || typeof req.query.filename !== "string") {
    res.status(400).json({ error: "filename query param missing" });
    return;
  }
  deleteImage(req.query.filename);
  res.status(200).json(SuccessResponseTemplate);
});

app.post(ApiEndpoints.POST.Document, (req: Request, res: Response) => {
  const token = getTokenFromAuthHeader(req, JWT_SECRET);
  if (!req.body?.title || !token?.userId) {
    console.warn("document POST request body invalid");
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const updatedDocument: MarkdownDocument = createOrUpdateDocument(
    req.body,
    +token.userId,
    true
  );
  if (!req.body.id) {
    res.status(201).json(updatedDocument);
  } else {
    res.status(200).json(updatedDocument);
  }
});

app.post(ApiEndpoints.POST.DeleteDocument, (req: Request, res: Response) => {
  if (!req.query?.markdownDocumentId) {
    res.status(400).json({ error: "Invalid markdown document id" });
    return;
  }
  deleteDocument(+req.query.markdownDocumentId);
  res.status(200).json(SuccessResponseTemplate);
});

app.post(ApiEndpoints.POST.Gallery, (req: Request, res: Response) => {
  if (!req.body) {
    console.warn("Request has no body");
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
    console.warn("Page creation request is missing markdown document id");
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

app.get(ApiEndpoints.GET.AllDocuments, (req: Request, res: Response) => {
  const token = getTokenFromAuthHeader(req, JWT_SECRET);
  if (!token?.userId) {
    res.status(401).json(CREDENTIAL_VALIDATION_ERROR);
    return;
  }

  const markdownDocuments = retrieveAllMarkdownDocumentsForUser(+token.userId);
  res.status(200).json(markdownDocuments);
});

app.get(ApiEndpoints.GET.Document, (req: Request, res: Response) => {
  const token = getTokenFromAuthHeader(req, JWT_SECRET);
  if (!token?.userId) {
    res.status(401).json(CREDENTIAL_VALIDATION_ERROR);
    return;
  }
  if (!req.query?.id) {
    res.status(400).json({ error: "Invalid or missing ID" });
    return;
  }
  const markdownDocument: MarkdownDocument =
    retrieveMarkdownDocumentWithPagesAndGalleries(+req.query.id);
  if (markdownDocument.ownerId !== +token.userId) {
    res.status(401).json(CREDENTIAL_VALIDATION_ERROR);
    return;
  }
  res.status(200).json(markdownDocument);
});

app.use("/images", express.static(uploadDir));
app.use("/welcomeImages", express.static(welcomeImageDir));

initDatabase();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

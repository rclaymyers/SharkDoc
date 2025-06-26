import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { initDatabase } from "./dbQueryExecutor";

const app = express();
app.use(cors());
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

app.post("/upload", upload.single("image"), (req: Request, res: Response) => {
  console.log("Got image upload request");
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.status(200).json({
    filename: req.file.filename,
    imagePath: `/images/${req.file.filename}`,
  });
});

app.use("/images", express.static(uploadDir));

initDatabase();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

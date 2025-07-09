import { Express, NextFunction, Request, Response } from "express";
import {
  ApiEndpoints,
  INVALID_CREDENTIALS_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
} from "../sharedModels/ApiConstants";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SuccessResponse } from "./constants/responseTemplates";
import {
  createImageInGallery,
  createOrUpdateDocument,
  createOrUpdateGallery,
  createPage,
  createUser,
  selectUser,
  updatePage,
} from "./dbQueryExecutor";
import { MarkdownDocumentCreationRequest } from "../sharedModels/MarkdownDocument";
import {
  WelcomeDocumentPage1,
  WelcomeDocumentPage2,
} from "./constants/welcomeDocument";
import { GalleryCreationRequest } from "../sharedModels/Gallery";

export interface User {
  id: number;
  username: string;
  hashedPassword: string;
}

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const CREDENTIAL_VALIDATION_ERROR = {
  message: INVALID_CREDENTIALS_MESSAGE,
} as const;
export const USERNAME_TAKEN_ERROR = {
  message: USERNAME_TAKEN_MESSAGE,
} as const;
const TOKEN_VALIDITY_DURATION = "24h";

export const setupAuthEndpoints = (app: Express, JWT_SECRET: string): void => {
  app.post(
    ApiEndpoints.POST.RegisterUser,
    async (req: Request, res: Response) => {
      console.log("Register user request:", req.body);
      //todo validate request body
      const { username, unhashedPass } = req.body;
      const hashedPass: string = await bcrypt.hash(unhashedPass, 10);
      const existingUser = selectUser(username);
      if (existingUser) {
        res.status(409).json(USERNAME_TAKEN_ERROR);
        return;
      }
      createUser(username, hashedPass);
      const user = selectUser(username);
      if (!user?.id) {
        res.status(201).json(SuccessResponse);
        return;
      }
      const newDocument = createOrUpdateDocument(
        new MarkdownDocumentCreationRequest("Your First Sharkdown Document"),
        user.id,
        false
      );
      if (!newDocument) {
        res.status(201).json(SuccessResponse);
        return;
      }
      const page1 = createPage(newDocument.id);
      const page2 = createPage(newDocument.id);
      if (!page1 || !page2) {
        return;
      }
      page1.content = WelcomeDocumentPage1;
      updatePage(page1);
      page2.content = WelcomeDocumentPage2;
      updatePage(page2);
      const newGallery = createOrUpdateGallery(
        new GalleryCreationRequest("Dogs and Cats", newDocument.id)
      );
      if (!newGallery?.id) {
        res.status(201).json(SuccessResponse);
      }
      createImageInGallery("/welcomeImages/testImage1.jpg", newGallery.id);
      createImageInGallery("/welcomeImages/testImage2.jpg", newGallery.id);
      createImageInGallery("/welcomeImages/testImage3.jpg", newGallery.id);
      createImageInGallery("/welcomeImages/testImage4.jpg", newGallery.id);
      createImageInGallery("/welcomeImages/testImage5.jpg", newGallery.id);

      res.status(201).json(SuccessResponse);
    }
  );
  app.post(ApiEndpoints.POST.LoginUser, async (req: Request, res: Response) => {
    //todo validate request body
    const { username, unhashedPass } = req.body;
    console.log("Logging in user with body:", req.body);
    const user = selectUser(username);
    console.log("Got user from db:", user);
    if (!user || !(await bcrypt.compare(unhashedPass, user.hashedPassword))) {
      res.status(401).json(CREDENTIAL_VALIDATION_ERROR);
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: TOKEN_VALIDITY_DURATION,
    });
    res.status(200).json({ token, username });
  });
};

export const buildTokenVerificationMiddleware = (JWT_SECRET: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    //todo verify header length
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
};

export const verifyResourceOwnerAndRespond = (
  token: JwtPayload,
  idToCheck: number,
  successCode: number,
  successBody: any,
  res: Response
): void => {
  if (token.userId === idToCheck) {
    res.status(successCode).json(successBody);
  } else {
    res.status(403).json(CREDENTIAL_VALIDATION_ERROR);
  }
};

export const getTokenFromAuthHeader = (
  req: Request,
  JWT_SECRET: string
): (JwtPayload & { userId: string }) | null => {
  const headers = req?.headers?.["authorization"];
  const splitHeaders = headers?.split(" ");
  if (!splitHeaders?.length || splitHeaders.length < 2) {
    return null;
  }
  const token = splitHeaders[1];
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload & {
      userId: string;
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

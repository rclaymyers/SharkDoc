import { Express, NextFunction, Request, Response } from "express";
import { ApiEndpoints } from "../sharedModels/ApiConstants";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SuccessResponse } from "./constants/responseTemplates";
import { createUser, selectUser } from "./dbQueryExecutor";

export interface User {
  id: number;
  username: string;
  hashedPassword: string;
}

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const CREDENTIAL_VALIDATION_ERROR = {
  message: "Credentials invalid",
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
      createUser(username, hashedPass);
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
    res.status(200).json({ token });
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

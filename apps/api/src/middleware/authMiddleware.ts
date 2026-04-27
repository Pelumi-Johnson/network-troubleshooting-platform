import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Missing authorization token",
      });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = authService.verifyToken(token);

    const user = await authService.getUserById(payload.sub);

    if (!user) {
      res.status(401).json({
        message: "Invalid authorization token",
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authorization token",
    });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = authService.verifyToken(token);

    const user = await authService.getUserById(payload.sub);

    if (user) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
}
import type { Request, Response } from "express";
import { authService } from "../services/authService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({
          message: "Email and password are required",
        });
        return;
      }

      if (!isValidEmail(String(email))) {
        res.status(400).json({
          message: "Enter a valid email address",
        });
        return;
      }

      if (String(password).length < 8) {
        res.status(400).json({
          message: "Password must be at least 8 characters",
        });
        return;
      }

      const result = await authService.register(
        String(email),
        String(password),
        name ? String(name) : undefined
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to register user",
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          message: "Email and password are required",
        });
        return;
      }

      const result = await authService.login(String(email), String(password));

      res.json(result);
    } catch {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      user: req.user,
    });
  },
};
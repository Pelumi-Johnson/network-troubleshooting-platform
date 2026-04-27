import type { Response } from "express";
import { progressService } from "../services/progressService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const progressController = {
  async getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const progress = await progressService.getProgress(req.user?.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const attempts = await progressService.getAttempts(req.user?.id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get attempts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async saveProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { labSlug, score } = req.body;

      if (!labSlug || typeof score !== "number") {
        res.status(400).json({
          message: "labSlug and score are required",
        });
        return;
      }

      const progress = await progressService.saveProgress(
        String(labSlug),
        Number(score),
        req.user?.id
      );

      res.status(201).json(progress);
    } catch (error) {
      res.status(500).json({
        message: "Failed to save progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const labSlug = String(req.params.labSlug);
      const result = await progressService.deleteProgress(
        labSlug,
        req.user?.id
      );

      if (!result) {
        res.status(404).json({
          message: "Progress not found",
        });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async clearProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await progressService.clearProgress(req.user?.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to clear progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async clearAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await progressService.clearAttempts(req.user?.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to clear attempts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
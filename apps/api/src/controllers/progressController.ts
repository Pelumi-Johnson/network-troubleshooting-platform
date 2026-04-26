import type { Request, Response } from "express";
import { progressService } from "../services/progressService";

export const progressController = {
  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const progress = await progressService.getProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAttempts(req: Request, res: Response): Promise<void> {
    try {
      const attempts = await progressService.getAttempts();
      res.json(attempts);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get attempts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async saveProgress(req: Request, res: Response): Promise<void> {
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
        Number(score)
      );

      res.status(201).json(progress);
    } catch (error) {
      res.status(500).json({
        message: "Failed to save progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteProgress(req: Request, res: Response): Promise<void> {
    try {
      const labSlug = String(req.params.labSlug);
      const result = await progressService.deleteProgress(labSlug);

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

  async clearProgress(req: Request, res: Response): Promise<void> {
    try {
      const result = await progressService.clearProgress();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to clear progress",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async clearAttempts(req: Request, res: Response): Promise<void> {
    try {
      const result = await progressService.clearAttempts();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to clear attempts",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
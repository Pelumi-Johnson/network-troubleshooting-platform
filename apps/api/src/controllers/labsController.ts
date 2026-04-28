import type { Response } from "express";
import { labsService } from "../services/labsService";
import { labSessionsService } from "../services/labSessionsService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

export const labsController = {
  getAllLabs(_req: AuthenticatedRequest, res: Response): void {
    try {
      const labs = labsService.getAllLabs();
      res.json(labs);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load labs",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getLabBySlug(req: AuthenticatedRequest, res: Response): void {
    try {
      const slug = String(req.params.slug);
      const lab = labsService.getLabBySlug(slug);

      if (!lab) {
        res.status(404).json({
          message: "Lab not found",
        });
        return;
      }

      res.json(lab);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load lab",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async startSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug);

      const session = await labSessionsService.startSession(
        slug,
        req.user?.id
      );

      if (!session) {
        res.status(404).json({
          message: "Lab not found",
        });
        return;
      }

      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({
        message: "Failed to start lab session",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
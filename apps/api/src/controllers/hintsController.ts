import type { Request, Response } from "express";
import { hintService } from "../services/hintService";

export const hintsController = {
  async getHint(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const result = await hintService.getHint(sessionId);

      if (!result.ok) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Failed to get hint",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
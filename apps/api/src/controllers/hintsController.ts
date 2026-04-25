import type { Request, Response } from "express";
import { hintService } from "../services/hintService";

export const hintsController = {
  getNextHint(req: Request, res: Response): void {
    const sessionId = String(req.params.sessionId);

    const result = hintService.getNextHint(sessionId);

    if (!result.ok) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  }
};
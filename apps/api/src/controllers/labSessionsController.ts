import type { Request, Response } from "express";
import { labSessionsService } from "../services/labSessionsService";
import { commandService } from "../services/commandService";
import { labsService } from "../services/labsService";

export const labSessionsController = {
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const session = await labSessionsService.startSession(slug);

      if (!session) {
        res.status(404).json({ message: "Lab not found" });
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

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const session = await labSessionsService.getSession(sessionId);

      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({
        message: "Failed to get lab session",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const { deviceId, command } = req.body;

      if (!deviceId || !command) {
        res.status(400).json({
          message: "deviceId and command are required",
        });
        return;
      }

      const result = await commandService.executeCommand(
        sessionId,
        String(deviceId),
        String(command)
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to execute command",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getHint(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = String(req.params.sessionId);
      const session = await labSessionsService.getSession(sessionId);

      if (!session) {
        res.status(404).json({
          ok: false,
          message: "Session not found.",
        });
        return;
      }

      if (session.status === "completed") {
        res.status(400).json({
          ok: false,
          message: "Lab is already completed.",
        });
        return;
      }

      const lab = labsService.getLabById(session.labId);

      if (!lab) {
        res.status(404).json({
          ok: false,
          message: "Lab definition not found.",
        });
        return;
      }

      const hints = lab.hints || [];
      const maxHints = lab.scoring?.maxHints || hints.length;

      if (session.hintsUsed >= maxHints || session.hintsUsed >= hints.length) {
        res.status(400).json({
          ok: false,
          message: "No more hints available.",
        });
        return;
      }

      const hint = hints[session.hintsUsed];

      session.hintsUsed += 1;
      session.score = Math.max(
        0,
        session.score - (lab.scoring?.hintPenalty || 0)
      );

      const updatedSession = await labSessionsService.updateSession(session);

      res.json({
        ok: true,
        hintLevel: hint.level,
        text: hint.text,
        score: updatedSession.score,
        hintsUsed: updatedSession.hintsUsed,
        remainingHints: Math.max(0, maxHints - updatedSession.hintsUsed),
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Failed to get hint",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
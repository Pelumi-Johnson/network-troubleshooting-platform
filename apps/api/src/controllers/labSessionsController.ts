import type { Request, Response } from "express";
import { labSessionsService } from "../services/labSessionsService";
import { commandService } from "../services/commandService";

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

  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await labSessionsService.getActiveSessions();

      res.json(
        sessions.map((session) => ({
          sessionId: session.sessionId,
          labId: session.labId,
          labSlug: session.labSlug,
          status: session.status,
          score: session.score,
          hintsUsed: session.hintsUsed,
          startedAt: session.startedAt,
        }))
      );
    } catch (error) {
      res.status(500).json({
        message: "Failed to get active sessions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async clearActiveSession(req: Request, res: Response): Promise<void> {
    try {
      const labSlug = String(req.params.labSlug);
      const result = await labSessionsService.clearActiveSession(labSlug);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to clear active session",
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
};
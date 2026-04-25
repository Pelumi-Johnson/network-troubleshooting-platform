import type { Request, Response } from "express";
import { labSessionsService } from "../services/labSessionsService";
import { commandService } from "../services/commandService";

export const labSessionsController = {
  startSession(req: Request, res: Response): void {
    const slug = String(req.params.slug);

    const session = labSessionsService.startSession(slug);

    if (!session) {
      res.status(404).json({ message: "Lab not found" });
      return;
    }

    res.status(201).json(session);
  },

  getSession(req: Request, res: Response): void {
    const sessionId = String(req.params.sessionId);

    const session = labSessionsService.getSession(sessionId);

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json(session);
  },

  executeCommand(req: Request, res: Response): void {
    const sessionId = String(req.params.sessionId);
    const { deviceId, command } = req.body;

    if (typeof deviceId !== "string" || typeof command !== "string") {
      res.status(400).json({ message: "deviceId and command must be strings" });
      return;
    }

    if (!deviceId.trim() || !command.trim()) {
      res.status(400).json({ message: "deviceId and command are required" });
      return;
    }

    const result = commandService.executeCommand(sessionId, deviceId, command);

    res.json(result);
  }
};
import type { Request, Response } from "express";
import { labsService } from "../services/labsService";

export const labsController = {
  getAllLabs(_req: Request, res: Response): void {
    const labs = labsService.getAllLabs();
    res.json(labs);
  },

  getLabBySlug(req: Request, res: Response): void {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (!slug) {
      res.status(400).json({ message: "Invalid lab slug" });
      return;
    }

    const lab = labsService.getLabBySlug(slug);

    if (!lab) {
      res.status(404).json({ message: "Lab not found" });
      return;
    }

    res.json(lab);
  }
};
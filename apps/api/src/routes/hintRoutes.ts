import { Router } from "express";
import { hintsController } from "../controllers/hintsController";

const router = Router();

router.post("/:sessionId/hint", hintsController.getHint);

export default router;
import { Router } from "express";
import { hintsController } from "../controllers/hintsController";

const router = Router();

router.post("/:sessionId/hint", hintsController.getNextHint);

export default router;
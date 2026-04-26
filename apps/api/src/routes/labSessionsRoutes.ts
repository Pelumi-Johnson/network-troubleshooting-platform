import { Router } from "express";
import { labSessionsController } from "../controllers/labSessionsController";

const router = Router();

router.get("/active", labSessionsController.getActiveSessions);
router.delete("/active/:labSlug", labSessionsController.clearActiveSession);

router.get("/:sessionId", labSessionsController.getSession);
router.post("/:sessionId/command", labSessionsController.executeCommand);

export default router;
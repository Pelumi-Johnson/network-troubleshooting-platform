import { Router } from "express";
import { labsController } from "../controllers/labsController";
import { labSessionsController } from "../controllers/labSessionsController";

const router = Router();

router.get("/", labsController.getAllLabs);
router.post("/:slug/start", labSessionsController.startSession);
router.get("/:slug", labsController.getLabBySlug);

export default router;
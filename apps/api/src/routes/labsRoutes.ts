import { Router } from "express";
import { labsController } from "../controllers/labsController";
import { optionalAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(optionalAuth);

router.get("/", labsController.getAllLabs);
router.get("/:slug", labsController.getLabBySlug);
router.post("/:slug/start", labsController.startSession);

export default router;
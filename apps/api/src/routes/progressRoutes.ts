import { Router } from "express";
import { progressController } from "../controllers/progressController";

const router = Router();

router.get("/", progressController.getProgress);
router.get("/attempts", progressController.getAttempts);

router.post("/", progressController.saveProgress);

router.delete("/attempts", progressController.clearAttempts);
router.delete("/:labSlug", progressController.deleteProgress);
router.delete("/", progressController.clearProgress);

export default router;
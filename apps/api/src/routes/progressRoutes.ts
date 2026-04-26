import { Router } from "express";
import { progressController } from "../controllers/progressController";

const router = Router();

router.get("/", progressController.getProgress);
router.post("/", progressController.saveProgress);
router.delete("/", progressController.clearProgress);
router.delete("/:labSlug", progressController.deleteProgress);

export default router;
import { Router } from "express";
import labsRoutes from "./labsRoutes";
import labSessionsRoutes from "./labSessionsRoutes";
import hintRoutes from "./hintRoutes";
import progressRoutes from "./progressRoutes";

const router = Router();

router.use("/labs", labsRoutes);
router.use("/lab-sessions", labSessionsRoutes);
router.use("/lab-sessions", hintRoutes);
router.use("/progress", progressRoutes);

export default router;
import { Router } from "express";
import labsRoutes from "./labsRoutes";
import labSessionsRoutes from "./labSessionsRoutes";
import hintRoutes from "./hintRoutes";

const router = Router();

router.use("/labs", labsRoutes);
router.use("/lab-sessions", labSessionsRoutes);
router.use("/lab-sessions", hintRoutes);

export default router;
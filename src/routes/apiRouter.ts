import { Router } from "express";
import { getStatus } from "../controllers/apiController.js";
import gamesRouter from './gamesRouter.js'

const router = Router();

router.get("/", getStatus)
router.use("/games", gamesRouter);

export default router;

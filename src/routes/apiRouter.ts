import { Router } from "express";
import { getStatus } from "../controllers/apiController.js";
import gamesRouter from './gamesRouter.js'
import playersRouter from './playersRouter.js'

const router: Router = Router();

router.get("/", getStatus)
router.use("/games", gamesRouter);
router.use("/players", playersRouter);

export default router;

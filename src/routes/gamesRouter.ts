import { Router } from "express";
import { getStatus, generateNewGame, getGameStatus } from "../controllers/gamesController.js";
import movesRouter from './movesRouter.js'

const router = Router();

router.get("/", getStatus)

router.get("/new", generateNewGame)
router.get("/:gameID", getGameStatus);
router.use("/:gameID/moves", movesRouter);

export default router;

import { Router } from "express";
import { getStatus, generateNewGame, getGameStatus, joinGame, drawGame, resignGame } from "../controllers/gamesController.js";
import movesRouter from './movesRouter.js'

const router: Router = Router();

router.get("/", getStatus)

router.get("/:gameID", getGameStatus);

router.post("/new", generateNewGame);

router.post("/:gameID/join", joinGame);
router.post("/:gameID/draw", drawGame);
router.post("/:gameID/resign", resignGame);

router.use("/:gameID/moves", movesRouter);

export default router;

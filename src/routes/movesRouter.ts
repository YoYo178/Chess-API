import { Router } from "express";
import { getMoves, movePiece } from "../controllers/movesController.js";

// Need the upstream gameID parameter
const router = Router({ mergeParams: true });

router.get("/:pieceUID", getMoves);
router.post("/:pieceUID", movePiece);

export default router;

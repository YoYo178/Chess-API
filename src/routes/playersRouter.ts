import { Router } from "express";
import { getGameStatus } from "../controllers/playersController.js";

// Need the upstream gameID parameter
const router: Router = Router({ mergeParams: true });

router.get("/:playerID", getGameStatus);

export default router;

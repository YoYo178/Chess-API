import { Request, Response, Router } from "express";
let router: Router = Router();

import gamesRoute from "./games/index.js";

router.get("/", (req: Request, res: Response) => {
	res.status(200).send({ status: "success", timestamp: Date.now() });
})

router.use("/games", gamesRoute);

export default router;

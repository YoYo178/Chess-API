import express from "express";
let router = express.Router();

import gamesRoute from "./games/index.js";

router.get("/", (req, res) => {
	res.status(200).send({ status: "success", timestamp: Date.now() });
})

router.use("/games", gamesRoute);

export default router;

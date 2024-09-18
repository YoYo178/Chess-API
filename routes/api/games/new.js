import express from "express";
let router = express.Router();

import { ChessBoard } from '../../../game_src/ChessBoard.js';
import { games, generateGameID } from "../../../game_src/util.js";

router.get("/", (req, res) => {
    let gameID = "";
    do {
        gameID = generateGameID(6);
    }
    while (games.get(gameID));

    let game = new ChessBoard();
    game.init();
    games.set(gameID, game);

    let { positions, currentTurn } = game
    res.send({ gameID, positions, currentTurn });
})

export default router;

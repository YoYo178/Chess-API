import { games } from "@/game_src/util.js";
import { getGameState } from "@/utils/chess.utils.js";
import type { Request, Response } from "express";

export const getGameStatus = async (req: Request, res: Response) => {
    const playerID = String(req.params['playerID']);

    const match = Array.from(games.entries()).find(([_, game]) => game.hasPlayer(playerID));

    if (!match) {
        res.status(400).json({ success: false, error: 'No game found for the specified player!' });
        return;
    }

    const [gameID, game] = match;

    res.status(200).json({ success: true, data: { game: getGameState(game, gameID) } });
}
import type { Request, Response } from "express";

import { ChessBoard } from "@/game_src/ChessBoard.js";
import { GAME_VALIDITY_IN_SECONDS, games, generateGameID, timeouts } from "@/game_src/util.js";
import { getGameState } from "@/utils/chess.utils.js";

// Get status
export const getStatus = async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, timestamp: Date.now(), data: { games: [...games.keys()] } });
}

// Generate a new game
export const generateNewGame = async (req: Request, res: Response) => {
    const playerID = req.body?.playerID;
    const playerName = req.body?.playerName;

    if (!playerID || !playerName) {
        res.status(400).json({ success: false, error: 'playerID and playerName fields are required in JSON payload.' })
        return;
    }

    let gameID = generateGameID(6);

    // Just in case we roll an already existing ID, we re-roll for a maximum of 3 tries
    if (games.get(gameID)) {
        for (let i = 0; i < 3; i++) {
            gameID = generateGameID(6)
        }
    }

    try {
        const game = new ChessBoard({ name: playerName, id: playerID });
        await game.init();
        games.set(gameID, game);
        timeouts.set(gameID, setTimeout(() => {
            games.delete(gameID);
            timeouts.delete(gameID);
        }, GAME_VALIDITY_IN_SECONDS * 1000))

        res.status(200).json({ success: true, data: { game: getGameState(game, gameID) } });
    } catch (error) {
        res.status(500).send({ success: false, error: "An error occured while generating a new game." })
        return console.error(error)
    }
}

// Get a game's status
export const getGameStatus = async (req: Request, res: Response) => {
    const id = String(req.params['gameID']);
    const game = games.get(id);

    if (!game) {
        res.status(404).json({ success: false, error: 'No game was found for the specified ID.' });
        return;
    }

    res.status(200).json({ success: true, data: { game: getGameState(game, id) } })
}

export const joinGame = (req: Request, res: Response) => {
    const playerID = req.body?.playerID;
    const playerName = req.body?.playerName;

    if (!playerID || !playerName) {
        res.status(400).json({ success: false, error: 'playerID and playerName fields are required in JSON payload.' })
        return;
    }

    const gameID = String(req.params['gameID']);
    const game = games.get(gameID)

    if (!game) {
        res.status(404).json({ success: false, error: 'No game was found for the specified game ID.' })
        return;
    }

    const joinStatus = game.join({ name: playerName, id: playerID });

    if (!joinStatus) {
        res.status(400).json({ success: false, error: 'An error occured while joining the game.' });
        return;
    }

    const timeout = timeouts.get(gameID);
    clearTimeout(timeout);
    timeouts.delete(gameID);

    res.status(200).json({ success: true, data: { game: getGameState(game, gameID) } });
}

export const drawGame = (_req: Request, _res: Response) => {
 // TODO
}

export const resignGame = (_req: Request, _res: Response) => {
 // TODO
}
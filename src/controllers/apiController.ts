import type { Request, Response } from "express";

export const getStatus = async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, timestamp: Date.now() });
}
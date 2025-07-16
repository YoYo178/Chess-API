import type { Request, Response } from "express";

export const getStatus = async (req: Request, res: Response) => {
    res.status(200).send({ status: "success", timestamp: Date.now() });
}
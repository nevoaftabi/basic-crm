import { NextFunction } from "express";
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ error: "Missing authorization header "});
    }

    const [type, token] = authHeader.split(' ');

    if(type !== 'Bearer' || !token) {
        return res.status(401).json({error: "Invalid authorization header"})
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        req.userId = payload.userId;

        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token"});
    }
}
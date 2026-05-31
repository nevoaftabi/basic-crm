import express, { Request, Response, Router } from 'express';
import { DeleteUserBodySchema, PatchUserBodySchema, PutUserBodySchema, UserLoginSchema, UserRegisterSchema } from '../schemas';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { requireAuth } from '../middleware/requireAuth';

export const usersRouter = Router();

// Put, patch, delete, get
usersRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });

    if(!user) {
        return res.sendStatus(404);
    }

    return res.status(200).json({
        name: user.name,
        createdAt: user.createdAt,
        id: user.id
    });
});

usersRouter.patch("/me", requireAuth, async (req: Request, res: Response) => {
    const parsedBody = PatchUserBodySchema.safeParse(req.body);

    if(!parsedBody.success) {
        return res.sendStatus(400);
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });

    if(!existingUser) {
        return res.sendStatus(404);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: req.userId
        },
        data: parsedBody.data
    });

    return res.status(200).json({
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
    });
});

usersRouter.delete("/me", requireAuth, async (req: Request, res: Response) => {
    const parsed = DeleteUserBodySchema.safeParse(req.body);

    if(!parsed.success) {
        return res.sendStatus(400);
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });

    if(!existingUser) {
        return res.sendStatus(404);
    }

    const passwordsMatch = await bcrypt.compare(parsed.data.password, existingUser.passwordHash);

    if(!passwordsMatch) {
        return res.sendStatus(401);
    }

    await prisma.user.delete({
        where: {
            id: req.userId
        }
    });

    return res.sendStatus(204);
});

usersRouter.put("/me", requireAuth, async (req: Request, res: Response) => {
    const parsedBody = PutUserBodySchema.safeParse(req.body);

    if(!parsedBody.success) {
        return res.sendStatus(400);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });

    if(!user) {
        return res.sendStatus(404);
    }

    const passwordsMatch = await bcrypt.compare(parsedBody.data.currentPassword, user.passwordHash);

    if(!passwordsMatch) {
        return res.sendStatus(401);
    }

    const newPasswordHash = await bcrypt.hash(parsedBody.data.password, 10);

    const updated = await prisma.user.update({
        where: {
            id: req.userId
        },
        data: {
            passwordHash: newPasswordHash,
            email: parsedBody.data.email,
            name: parsedBody.data.name,
        }
    });

    return res.status(200).json({
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
    });
});


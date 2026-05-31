"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const schemas_1 = require("../schemas");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const requireAuth_1 = require("../middleware/requireAuth");
exports.usersRouter = (0, express_1.Router)();
// Put, patch, delete, get
exports.usersRouter.get("/me", requireAuth_1.requireAuth, async (req, res) => {
    const user = await db_1.prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });
    if (!user) {
        return res.sendStatus(404);
    }
    return res.status(200).json({
        name: user.name,
        createdAt: user.createdAt,
        id: user.id
    });
});
exports.usersRouter.patch("/me", requireAuth_1.requireAuth, async (req, res) => {
    const parsedBody = schemas_1.PatchUserBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.sendStatus(400);
    }
    const existingUser = await db_1.prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });
    if (!existingUser) {
        return res.sendStatus(404);
    }
    const updatedUser = await db_1.prisma.user.update({
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
exports.usersRouter.delete("/me", requireAuth_1.requireAuth, async (req, res) => {
    const parsed = schemas_1.DeleteUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const existingUser = await db_1.prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });
    if (!existingUser) {
        return res.sendStatus(404);
    }
    const passwordsMatch = await bcrypt_1.default.compare(parsed.data.password, existingUser.passwordHash);
    if (!passwordsMatch) {
        return res.sendStatus(401);
    }
    await db_1.prisma.user.delete({
        where: {
            id: req.userId
        }
    });
    return res.sendStatus(204);
});
exports.usersRouter.put("/me", requireAuth_1.requireAuth, async (req, res) => {
    const parsedBody = schemas_1.PutUserBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.sendStatus(400);
    }
    const user = await db_1.prisma.user.findUnique({
        where: {
            id: req.userId
        }
    });
    if (!user) {
        return res.sendStatus(404);
    }
    const passwordsMatch = await bcrypt_1.default.compare(parsedBody.data.currentPassword, user.passwordHash);
    if (!passwordsMatch) {
        return res.sendStatus(401);
    }
    const newPasswordHash = await bcrypt_1.default.hash(parsedBody.data.password, 10);
    const updated = await db_1.prisma.user.update({
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

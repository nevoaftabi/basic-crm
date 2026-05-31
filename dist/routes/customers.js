"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRouter = void 0;
const db_1 = require("../db");
const requireAuth_1 = require("../middleware/requireAuth");
const schemas_1 = require("../schemas");
const express_1 = require("express");
exports.customersRouter = (0, express_1.Router)();
exports.customersRouter.get('/', requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const customers = await db_1.prisma.customer.findMany({
        where: {
            userId: req.userId
        }
    });
    return res.json({ customers });
});
exports.customersRouter.get("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.sendStatus(401);
    }
    const parsed = schemas_1.GetCustomerSchema.safeParse(req.params);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const customer = await db_1.prisma.customer.findUnique({
        where: {
            id: parsed.data.id,
            userId: req.userId
        }
    });
    if (!customer) {
        return res.sendStatus(404);
    }
    return res.status(200).json(customer);
});
exports.customersRouter.patch("/:id", requireAuth_1.requireAuth, async (req, res) => {
    const parsedParams = schemas_1.PatchCustomerParamsSchema.safeParse(req.params);
    const parsedBody = schemas_1.PatchCustomerBodySchema.safeParse(req.body);
    if (!parsedParams.success || !parsedBody.success) {
        return res.sendStatus(400);
    }
    const existingCustomer = await db_1.prisma.customer.findUnique({
        where: {
            id: parsedParams.data.id,
            userId: req.userId
        }
    });
    if (!existingCustomer) {
        return res.sendStatus(404);
    }
    await db_1.prisma.customer.update({
        where: {
            id: parsedParams.data.id,
            userId: req.userId
        },
        data: {
            name: parsedBody.data.name,
            company: parsedBody.data.company,
            email: parsedBody.data.email,
            phone: parsedBody.data.phone
        }
    });
    return res.sendStatus(204);
});
exports.customersRouter.post("/", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.sendStatus(401);
    }
    const parsed = schemas_1.PostCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const customer = await db_1.prisma.customer.create({
        data: {
            userId: req.userId,
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            company: parsed.data.company
        }
    });
    return res.status(201).json({
        customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            company: customer.company,
            createdAt: customer.createdAt
        }
    });
});
exports.customersRouter.put("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.sendStatus(401);
    }
    const parsedParams = schemas_1.PutCustomerParamsSchema.safeParse(req.params);
    const parsedBody = schemas_1.PutCustomerBodySchema.safeParse(req.body);
    if (!parsedParams.success || !parsedBody.success) {
        return res.sendStatus(400);
    }
    const existingCustomer = await db_1.prisma.customer.findUnique({
        where: {
            id: parsedParams.data.id,
            userId: req.userId
        }
    });
    if (!existingCustomer) {
        return res.sendStatus(404);
    }
    const customer = await db_1.prisma.customer.update({
        where: {
            id: parsedParams.data.id,
        },
        data: parsedBody.data
    });
    return res.json({ customer });
});
exports.customersRouter.delete("/:id", requireAuth_1.requireAuth, async (req, res) => {
    if (!req.userId) {
        return res.sendStatus(401);
    }
    const parsed = schemas_1.DeleteCustomerSchema.safeParse(req.params);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const customer = await db_1.prisma.customer.findUnique({
        where: {
            id: parsed.data.id,
            userId: req.userId
        }
    });
    if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
    }
    await db_1.prisma.customer.delete({
        where: {
            id: customer.id
        }
    });
    return res.sendStatus(204);
});

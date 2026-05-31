import { prisma } from '../db';
import { requireAuth } from '../middleware/requireAuth';
import { PostCustomerSchema, DeleteCustomerSchema, GetCustomerSchema, PutCustomerBodySchema, PutCustomerParamsSchema, PatchCustomerParamsSchema, PatchCustomerBodySchema } from '../schemas';
import { Router, Request, Response } from 'express';

export const customersRouter = Router();

customersRouter.get('/', requireAuth, async (req: Request, res: Response) => {
    if(!req.userId) {
        return res.status(401).json({error: "Unauthorized" });
    }

    const customers = await prisma.customer.findMany({
        where: {
            userId: req.userId
        }
    });

    return res.json({ customers });
});

customersRouter.get("/:id", requireAuth, async (req: Request, res: Response) => {
    if(!req.userId) {
        return res.sendStatus(401);
    }

    const parsed = GetCustomerSchema.safeParse(req.params);

    if(!parsed.success) {
        return res.sendStatus(400);
    }

    const customer = await prisma.customer.findUnique({
        where: {
            id: parsed.data.id,
            userId: req.userId
        }
    });

    if(!customer) {
        return res.sendStatus(404);
    }

    return res.status(200).json(customer);
});

customersRouter.patch("/:id", requireAuth, async (req: Request, res: Response) => {
    const parsedParams = PatchCustomerParamsSchema.safeParse(req.params);
    const parsedBody = PatchCustomerBodySchema.safeParse(req.body);

    if(!parsedParams.success || !parsedBody.success) {
        return res.sendStatus(400);
    }

    const existingCustomer = await prisma.customer.findUnique({
        where: {
            id: parsedParams.data.id,
            userId: req.userId
        }
    });

    if(!existingCustomer) {
        return res.sendStatus(404);
    }

    await prisma.customer.update({
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

customersRouter.post("/", requireAuth, async (req: Request, res: Response) => {
    if(!req.userId) {
        return res.sendStatus(401);
    }

    const parsed = PostCustomerSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.sendStatus(400);
    }

    const customer = await prisma.customer.create({
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

customersRouter.put("/:id", requireAuth, async (req: Request, res: Response) => {
    if(!req.userId) {
        return res.sendStatus(401);
    }

    const parsedParams = PutCustomerParamsSchema.safeParse(req.params);
    const parsedBody = PutCustomerBodySchema.safeParse(req.body);
    
    if(!parsedParams.success || !parsedBody.success) {
        return res.sendStatus(400);
    }

    const existingCustomer = await prisma.customer.findUnique({
        where: {
            id: parsedParams.data.id,
            userId: req.userId
        }
    });

    if(!existingCustomer) {
        return res.sendStatus(404);
    }

    const customer = await prisma.customer.update({
        where: {
            id: parsedParams.data.id,
        },
        data: parsedBody.data
    });

    return res.json({customer});
});

customersRouter.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    if(!req.userId) {
        return res.sendStatus(401);
    }

    const parsed = DeleteCustomerSchema.safeParse(req.params);

    if(!parsed.success) {
        return res.sendStatus(400);
    }

    const customer = await prisma.customer.findUnique({
        where: {
            id: parsed.data.id,
            userId: req.userId
        }
    });

    if(!customer) {
        return res.status(404).json({ error: "Customer not found"});
    }

    await prisma.customer.delete({
        where: {
            id: customer.id
        }
    });

    return res.sendStatus(204);
});
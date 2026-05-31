import { z } from 'zod';

export const UserRegisterSchema = z.object({
    name: z.string().min(5).max(20),
    password: z.string().min(8).max(50),
    email: z.email()
});

export const UserLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(50)
});

export const PostCustomerSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email().optional(),
    phone: z.string().min(1).max(30).optional(),
    company: z.string().min(1).max(100).optional()
});

export const DeleteCustomerSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const GetCustomerSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const PutCustomerBodySchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email().optional(),
    phone: z.string().min(1).max(30),
    company: z.string().min(1).max(100)
});

export const PutCustomerParamsSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const PatchCustomerParamsSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const PatchCustomerBodySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.email().optional(),
    phone: z.string().min(1).max(30).optional(),
    company: z.string().min(1).max(100).optional()
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });

export const PutUserBodySchema = z.object({
    name: z.string().min(5).max(20),
    password: z.string().min(8).max(50),
    currentPassword: z.string().min(8).max(50),
    email: z.email()
});

export const PatchUserBodySchema = z.object({
    name: z.string().min(5).max(20).optional(),
    email: z.email().optional()
}).refine((data) => Object.keys(data).length > 0, { 
    message: "At least one field is required"
});

export const DeleteUserBodySchema = z.object({
    password: z.string().min(8).max(50),
})
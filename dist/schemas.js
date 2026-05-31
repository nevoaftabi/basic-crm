"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserBodySchema = exports.PatchUserBodySchema = exports.PutUserBodySchema = exports.PatchCustomerBodySchema = exports.PatchCustomerParamsSchema = exports.PutCustomerParamsSchema = exports.PutCustomerBodySchema = exports.GetCustomerSchema = exports.DeleteCustomerSchema = exports.PostCustomerSchema = exports.UserLoginSchema = exports.UserRegisterSchema = void 0;
const zod_1 = require("zod");
exports.UserRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(5).max(20),
    password: zod_1.z.string().min(8).max(50),
    email: zod_1.z.email()
});
exports.UserLoginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(8).max(50)
});
exports.PostCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().min(1).max(30).optional(),
    company: zod_1.z.string().min(1).max(100).optional()
});
exports.DeleteCustomerSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
exports.GetCustomerSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
exports.PutCustomerBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().min(1).max(30),
    company: zod_1.z.string().min(1).max(100)
});
exports.PutCustomerParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
exports.PatchCustomerParamsSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive()
});
exports.PatchCustomerBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    email: zod_1.z.email().optional(),
    phone: zod_1.z.string().min(1).max(30).optional(),
    company: zod_1.z.string().min(1).max(100).optional()
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });
exports.PutUserBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(5).max(20),
    password: zod_1.z.string().min(8).max(50),
    currentPassword: zod_1.z.string().min(8).max(50),
    email: zod_1.z.email()
});
exports.PatchUserBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(5).max(20).optional(),
    email: zod_1.z.email().optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
});
exports.DeleteUserBodySchema = zod_1.z.object({
    password: zod_1.z.string().min(8).max(50),
});

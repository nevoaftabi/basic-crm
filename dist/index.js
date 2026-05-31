"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const customers_1 = require("./routes/customers");
const users_1 = require("./routes/users");
const schemas_1 = require("./schemas");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("./generated/prisma/client");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((req, _, next) => {
    console.log(`${req.method} ${req.path}`);
    return next();
});
app.use(express_1.default.json());
app.get('/health', (_, res) => {
    return res.sendStatus(200);
});
app.get('/db-health', async (_, res) => {
    const result = await db_1.prisma.$queryRaw `SELECT NOW()`;
    return res.json({
        status: 'ok',
        databaseTime: result[0].now
    });
});
app.post("/auth/register", async (req, res) => {
    const parsed = schemas_1.UserRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const passwordHash = await bcrypt_1.default.hash(parsed.data.password, 10);
    try {
        const user = await db_1.prisma.user.create({
            data: {
                name: parsed.data.name,
                passwordHash,
                email: parsed.data.email
            }
        });
        // Mostly for the app/client to know registration worked and to immediately identify the created account
        // Never return the password hash, or the entire user (includes the password hash).
        return res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ error: "Email is already registered" });
        }
        return res.sendStatus(500);
    }
});
// Use /auth only for authentication/session routes
// /auth/register, /auth/login
// /customers
// /customers/:id
// the customers route requires auth but does not start with auth
// the word auth should describe the route's job not whether the route is protected. protected routes use middleware
app.post('/auth/login', async (req, res) => {
    const parsed = schemas_1.UserLoginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.sendStatus(400);
    }
    const user = await db_1.prisma.user.findUnique({
        where: { email: parsed.data.email }
    });
    if (!user) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }
    const isPasswordValid = await bcrypt_1.default.compare(parsed.data.password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        token
    });
});
app.use("/customers", customers_1.customersRouter);
app.use("/users", users_1.usersRouter);
app.use((err, _, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Malformed JSON body' });
    }
    return next(err);
});
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

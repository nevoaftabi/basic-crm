import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from './db';
import { customersRouter } from './routes/customers';
import { usersRouter } from './routes/users';
import { UserLoginSchema, UserRegisterSchema } from './schemas';
import jwt from 'jsonwebtoken';
import { Prisma } from './generated/prisma/client';

const PORT = process.env.PORT || 3000;
const app = express();

app.use((req: Request, _: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    return next();
});

app.use(express.json());

app.get('/health', (_: Request, res: Response) => {
    return res.sendStatus(200);
});

app.get('/db-health', async (_: Request, res: Response) => {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;

    return res.json({
        status: 'ok', 
        databaseTime: result[0].now
    });
});

app.post("/auth/register", async (req: Request, res: Response) => {
    const parsed = UserRegisterSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.sendStatus(400);
    } 

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    try {
        const user = await prisma.user.create({
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
    catch(error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ error: "Email is already registered"});
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
app.post('/auth/login', async (req: Request, res: Response) => {
    const parsed = UserLoginSchema.safeParse(req.body);
    
    if(!parsed.success) {
        return res.sendStatus(400);
    }
    
    const user = await prisma.user.findUnique({
        where: { email: parsed.data.email }
    });
    
    if(!user) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }
    
    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    
    if(!isPasswordValid) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    return res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        token
    });
});

app.use("/customers", customersRouter);
app.use("/users", usersRouter);

app.use((err: unknown, _: Request, res: Response, next: NextFunction) => {
    if(err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({error: 'Malformed JSON body'});
    }

    return next(err);
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
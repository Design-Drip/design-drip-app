import { auth } from '@clerk/nextjs/server';
import { Context, Next } from "hono";
import { HTTPException } from 'hono/http-exception';

async function verifyDesigner(c: Context<any, any, {}>, next: Next) {
    const user = await auth()

    if (!user.sessionClaims?.metadata.role) {
        throw new HTTPException(401, {
            message: "Authentication required"
        })
    }

    const userRole = user.sessionClaims?.metadata.role.toLowerCase();
    if (userRole !== "admin" && userRole !== "designer") {
        throw new HTTPException(403, {
            message: "You don't have permission to access this resource"
        })
    }

    await next()
}

export default verifyDesigner; 
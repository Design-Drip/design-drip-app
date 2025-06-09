import { auth, clerkClient } from "@clerk/nextjs/server";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

async function verifyAuth(c: Context<any, any, {}>, next: Next) {
  const { userId } = await auth();
  if (!userId) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  c.set("client", client);
  c.set("user", user);

  await next();
}

export default verifyAuth;

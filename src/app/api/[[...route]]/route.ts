import { Context, Hono } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";

import authConfig from "@/auth.config";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
  return {
    secret: c.env.AUTH_SECRET,
    ...authConfig,
  };
}

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

// const routes = app.route("/users", users);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// export type AppType = typeof routes;

import { Hono } from "hono";
import { handle } from "hono/vercel";

import paymentMethods from "./payments/paymentMethods";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app.route("/payments/payment-methods", paymentMethods);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

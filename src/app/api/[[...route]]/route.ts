import { Hono } from "hono";
import { handle } from "hono/vercel";

import client from "@/lib/db";

import ai from "./ai";
import paymentMethods from "./payments/paymentMethods";
import products from "./products";

client.connect();

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/ai", ai)
  .route("/payments/payment-methods", paymentMethods)
  .route("/products", products);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

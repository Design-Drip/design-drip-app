import { Hono } from "hono";
import { handle } from "hono/vercel";

import dbConnect from "@/lib/db";

import ai from "./ai";
import design from "./design";
import paymentMethods from "./payments/paymentMethods";
import products from "./products";
import wishlist from "./wishlist";

await dbConnect();

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/ai", ai)
  .route("/design", design)
  .route("/payments/payment-methods", paymentMethods)
  .route("/products", products)
  .route("/wish-list", wishlist);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

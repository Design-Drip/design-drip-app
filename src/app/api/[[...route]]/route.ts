import { Hono } from "hono";
import { handle } from "hono/vercel";

import dbConnect from "@/lib/db";

import ai from "./ai";
import design from "./design";
import products from "./products";
import wishlist from "./wishlist";
import designTemplate from "./designTemplates";
import cart from "./cart";
import orders from "./orders";
import dashboard from "./dashboard";
import paymentMethods from "./payments/paymentMethods";
import checkout from "./payments/checkout";
import webhooks from "./payments/webhooks";
import requestQuotes from "./requestQuotes";

await dbConnect();

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/ai", ai)
  .route("/design", design)
  .route("/payments/payment-methods", paymentMethods)
  .route("/payments/checkout", checkout)
  .route("/payments/webhooks", webhooks)
  .route("/products", products)
  .route("/wish-list", wishlist)
  .route("/design-templates", designTemplate)
  .route("/cart", cart)
  .route("/orders", orders)
  .route("/dashboard", dashboard)
  .route("/request-quotes", requestQuotes);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

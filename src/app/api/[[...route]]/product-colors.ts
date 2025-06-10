import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import mongoose from "mongoose";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
const app = new Hono();

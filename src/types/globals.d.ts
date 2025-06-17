import { User } from "@clerk/nextjs/server";

export type Roles = "admin" | "user" | "guest";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

declare module "hono" {
  interface ContextVariableMap {
    user?: User;
  }
}

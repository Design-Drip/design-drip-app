export {};

export type Roles = "admin" | "user" | "guest";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

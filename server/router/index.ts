import { lazy } from "@orpc/server";

export const router = {
  // greeting: lazy(() => import("./greeting")),
  hello: lazy(() => import("./hello")),
  // planet: lazy(() => import("./planet")),
};

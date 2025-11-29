import { initTRPC } from "@trpc/server";
import type { H3Event } from "h3";
import { TrpcContext } from "./context";

// export const createTRPCContext = async (event: H3Event) => {
//   console.log("createTRPCContext", event.context.tenantId);

//   /**
//    * @see: https://trpc.io/docs/server/context
//    */
//   return { auth: event.context.auth };
// };

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TrpcContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

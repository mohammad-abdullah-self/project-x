import { baseProcedure, createTRPCRouter } from "~~/server/trpc/init";
import { z } from "zod";
import { usersTable } from "~~/server/db/schema_tenant";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  tenantUsers: baseProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(usersTable);
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

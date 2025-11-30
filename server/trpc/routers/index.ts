import { baseProcedure, createTRPCRouter } from "~~/server/trpc/init";
import { z } from "zod";
import { usersTable } from "~~/server/db/schema_tenant";
import { usersTable as Users } from "~~/server/db/schema";
import { desc } from "drizzle-orm";

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
  users: baseProcedure
    .input(
      z.object({
        pageSize: z.number().or(z.string().transform(Number)).default(20),
        page: z.number().or(z.string().transform(Number)).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(Users)
        .orderBy(desc(Users.id))
        // .limit(20);
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

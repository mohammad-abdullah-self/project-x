import { initTRPC } from "@trpc/server";
import axios from "axios";
import { eq } from "drizzle-orm";
import {
  invoiceSelectSchema,
  invoiceTable,
  ipnTable,
  subscriptionInsertSchema,
  subscriptionSelectSchema,
  subscriptionTable,
  userInsertSchema,
  userSelectSchema,
  userTable,
} from "~~/server/db/schema";
import { getSystemDb } from "~~/server/utils/system-db";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  createUser: t.procedure
    .input(
      z.object({
        name: z.string(),
        email: z.email(),
      })
    )
    .output(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.email(),
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await getSystemDb()
        .insert(userTable)
        .values(input)
        .returning();
      return user;
    }),
  getUserByEmail: t.procedure
    .input(
      z.object({
        email: z.email(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await getSystemDb()
        .select()
        .from(userTable)
        .where(eq(userTable.email, input.email));
      return user;
    }),

  createSubscription: t.procedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.string(),
        amountCents: z.number(),
      })
    )
    .output(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const [sub] = await getSystemDb()
        .insert(subscriptionTable)
        .values(input)
        .returning();

      return sub;
    }),

  createInvoice: t.procedure
    .input(
      z.object({
        subscriptionId: z.number(),
      })
    )
    .output(
      z.object({
        invoiceNumber: z.string(),
        amountCents: z.number(),
        currency: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [sub] = await getSystemDb()
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.id, input.subscriptionId));

      const invoiceNumber = `INV-${Date.now()}-${Math.floor(
        Math.random() * 9999
      )}`;

      const invoice = {
        invoiceNumber,
        amountCents: sub.amountCents,
        subscriptionId: sub.id,
      };

      const [inv] = await getSystemDb()
        .insert(invoiceTable)
        .values(invoice)
        .returning();

      return inv;
    }),

  updateInvoiceStatus: t.procedure
    .input(
      z.object({
        tranId: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [inv] = await getSystemDb()
        .update(invoiceTable)
        .set({ status: input.status })
        .where(eq(invoiceTable.invoiceNumber, input.tranId))
        .returning();
      return inv;
    }),

  createIpn: t.procedure
    .input(
      z.object({
        tranId: z.string(),
        rawPayload: z.json(),
      })
    )
    .mutation(async ({ input }) => {
      const [ipn] = await getSystemDb()
        .insert(ipnTable)
        .values(input)
        .returning();
      return ipn;
    }),
});

export type AppRouter = typeof appRouter;

import { index, json, real } from "drizzle-orm/gel-core";
import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";

//
// USERS
//
export const userTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("name_idx").on(table.name), // ✔ Good index
  ]
);

//
// SUBSCRIPTIONS
//
export const subscriptionTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => userTable.id)
    .notNull(),
  plan: varchar("plan", { length: 50 }).notNull().default("monthly"),
  amountCents: real("amount_cents").default(1000.0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

//
// INVOICES
//
export const invoiceTable = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 200 }).notNull().unique(),
    subscriptionId: integer("subscription_id")
      .references(() => subscriptionTable.id)
      .notNull(),
    amountCents: real("amount_cents"),
    currency: varchar("currency", { length: 3 }).default("BDT"),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("invoice_subscription_idx").on(table.subscriptionId)]
);

//
// IPN LOGS
//
export const ipnTable = pgTable("ipn_logs", {
  id: serial("id").primaryKey(),
  tranId: varchar("tran_id", { length: 200 }).notNull().unique(),
  rawPayload: json("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

import {
  timestamp,
  pgTable,
  text,
  integer,
  boolean,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";




export const users = pgTable(
    "user",
    {
      id: text("id").primaryKey(), 
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      role: text("role").$type<"user" | "admin">().default("user"),
      emailVerified: timestamp("emailVerified"),
      image: text("image"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
      lastActive: timestamp("last_active").defaultNow().notNull(),
      isOnline: boolean("is_online").default(false),
      profilePhoto: text("profile_photo"),
      phoneNumber: text("phone_number").notNull(),
    },
    (table) => ({
      emailIdx: index("user_email_idx").on(table.email),
      createdAtIdx: index("user_created_at_idx").on(table.createdAt),
      lastActiveIdx: index("user_last_active_idx").on(table.lastActive),
    })
  );
  
  // Auth.js tables
  export const accounts = pgTable(
    "account",
    {
      userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      type: text("type").$type<AdapterAccount["type"]>().notNull(),
      provider: text("provider").notNull(),
      providerAccountId: text("providerAccountId").notNull(),
      refresh_token: text("refresh_token"),
      access_token: text("access_token"),
      expires_at: integer("expires_at"),
      token_type: text("token_type"),
      scope: text("scope"),
      id_token: text("id_token"),
      session_state: text("session_state"),
    },
    (account) => ({
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    })
  );
  
  export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  });
  
  export const verificationTokens = pgTable(
    "verificationToken",
    {
      identifier: text("identifier").notNull(),
      token: text("token").notNull(),
      expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
      compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
  );
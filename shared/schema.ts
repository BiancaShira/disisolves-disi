import {
  sqliteTable,
  text,
  integer,
  blob,
  primaryKey,
  boolean,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: blob("sess", { mode: "json" }).notNull(),
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

// Users table with admin role support
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  software: text("software").notNull(),
  operatingSystem: text("operating_system"),
  softwareVersion: text("software_version"),
  priority: text("priority").notNull().default("medium"),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  tags: text("tags").notNull().default(""), // Use comma-separated string as array alternative
  votes: integer("votes").notNull().default(0),
  solved: boolean("solved").notNull().default(false),
  answersCount: integer("answers_count").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const answers = sqliteTable("answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  votes: integer("votes").notNull().default(0),
  isAccepted: boolean("is_accepted").notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  questionId: integer("question_id"),
  answerId: integer("answer_id"),
  type: text("type").notNull(), // 'up' or 'down'
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'question', 'answer'
  itemId: integer("item_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  reportedBy: text("reported_by").notNull(),
  status: text("status").notNull().default("pending"),
  resolvedBy: text("resolved_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  votes: true,
  solved: true,
  answersCount: true,
  createdAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  votes: true,
  isAccepted: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

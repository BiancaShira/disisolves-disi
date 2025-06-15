import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  software: text("software").notNull(),
  operatingSystem: text("operating_system"),
  softwareVersion: text("software_version"),
  priority: text("priority").notNull().default("medium"),
  authorId: integer("author_id").notNull(),
  authorName: text("author_name").notNull(),
  tags: text("tags").array().notNull().default([]),
  votes: integer("votes").notNull().default(0),
  solved: boolean("solved").notNull().default(false),
  answersCount: integer("answers_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  authorName: text("author_name").notNull(),
  votes: integer("votes").notNull().default(0),
  isAccepted: boolean("is_accepted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id"),
  answerId: integer("answer_id"),
  type: text("type").notNull(), // 'up' or 'down'
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

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

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

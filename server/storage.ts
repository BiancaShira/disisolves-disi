import {
  users,
  questions,
  answers,
  votes,
  reports,
  type User,
  type UpsertUser,
  type Question,
  type InsertQuestion,
  type Answer,
  type InsertAnswer,
  type Vote,
  type InsertVote,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Question methods
  getQuestions(filters?: {
    search?: string;
    software?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, updates: Partial<Question>): Promise<Question | undefined>;
  
  // Answer methods
  getAnswersByQuestionId(questionId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  updateAnswer(id: number, updates: Partial<Answer>): Promise<Answer | undefined>;
  
  // Vote methods
  getVote(userId: string, questionId?: number, answerId?: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, type: string): Promise<Vote | undefined>;
  deleteVote(id: number): Promise<boolean>;
  
  // Report methods (Admin only)
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined>;
  
  // Stats methods
  getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Question operations
  async getQuestions(filters?: {
    search?: string;
    software?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Question[]> {
    let query = db.select().from(questions);
    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          like(questions.title, `%${filters.search}%`),
          like(questions.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.software && filters.software !== "all") {
      conditions.push(eq(questions.software, filters.software));
    }

    if (filters?.status) {
      switch (filters.status) {
        case "solved":
          conditions.push(eq(questions.solved, true));
          break;
        case "unsolved":
          conditions.push(eq(questions.solved, false));
          break;
        case "no-answers":
          conditions.push(eq(questions.answersCount, 0));
          break;
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    switch (filters?.sortBy) {
      case "votes":
        query = query.orderBy(desc(questions.votes));
        break;
      case "answers":
        query = query.orderBy(desc(questions.answersCount));
        break;
      case "unsolved":
        query = query.orderBy(asc(questions.solved));
        break;
      default:
        query = query.orderBy(desc(questions.createdAt));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestion(id: number, updates: Partial<Question>): Promise<Question | undefined> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  // Answer operations
  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .orderBy(desc(answers.isAccepted), desc(answers.votes), asc(answers.createdAt));
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    
    // Update question answers count
    await db
      .update(questions)
      .set({ answersCount: sql`${questions.answersCount} + 1` })
      .where(eq(questions.id, answer.questionId));

    return newAnswer;
  }

  async updateAnswer(id: number, updates: Partial<Answer>): Promise<Answer | undefined> {
    const [updatedAnswer] = await db
      .update(answers)
      .set(updates)
      .where(eq(answers.id, id))
      .returning();

    // If marking as accepted, unmark others and mark question as solved
    if (updates.isAccepted && updatedAnswer) {
      await db
        .update(answers)
        .set({ isAccepted: false })
        .where(and(
          eq(answers.questionId, updatedAnswer.questionId),
          sql`${answers.id} != ${id}`
        ));

      await db
        .update(questions)
        .set({ solved: true })
        .where(eq(questions.id, updatedAnswer.questionId));
    }

    return updatedAnswer;
  }

  // Vote operations
  async getVote(userId: string, questionId?: number, answerId?: number): Promise<Vote | undefined> {
    const conditions = [eq(votes.userId, userId)];
    
    if (questionId) {
      conditions.push(eq(votes.questionId, questionId));
    }
    
    if (answerId) {
      conditions.push(eq(votes.answerId, answerId));
    }

    const [vote] = await db.select().from(votes).where(and(...conditions));
    return vote;
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();

    // Update vote count
    const adjustment = vote.type === "up" ? 1 : -1;
    
    if (vote.questionId) {
      await db
        .update(questions)
        .set({ votes: sql`${questions.votes} + ${adjustment}` })
        .where(eq(questions.id, vote.questionId));
    }

    if (vote.answerId) {
      await db
        .update(answers)
        .set({ votes: sql`${answers.votes} + ${adjustment}` })
        .where(eq(answers.id, vote.answerId));
    }

    return newVote;
  }

  async updateVote(id: number, type: string): Promise<Vote | undefined> {
    const [oldVote] = await db.select().from(votes).where(eq(votes.id, id));
    if (!oldVote) return undefined;

    const [updatedVote] = await db
      .update(votes)
      .set({ type })
      .where(eq(votes.id, id))
      .returning();

    // Calculate adjustment
    const oldAdjustment = oldVote.type === "up" ? -1 : 1;
    const newAdjustment = type === "up" ? 1 : -1;
    const totalAdjustment = oldAdjustment + newAdjustment;

    if (oldVote.questionId) {
      await db
        .update(questions)
        .set({ votes: sql`${questions.votes} + ${totalAdjustment}` })
        .where(eq(questions.id, oldVote.questionId));
    }

    if (oldVote.answerId) {
      await db
        .update(answers)
        .set({ votes: sql`${answers.votes} + ${totalAdjustment}` })
        .where(eq(answers.id, oldVote.answerId));
    }

    return updatedVote;
  }

  async deleteVote(id: number): Promise<boolean> {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    if (!vote) return false;

    await db.delete(votes).where(eq(votes.id, id));

    // Update vote counts
    const adjustment = vote.type === "up" ? -1 : 1;
    
    if (vote.questionId) {
      await db
        .update(questions)
        .set({ votes: sql`${questions.votes} + ${adjustment}` })
        .where(eq(questions.id, vote.questionId));
    }

    if (vote.answerId) {
      await db
        .update(answers)
        .set({ votes: sql`${answers.votes} + ${adjustment}` })
        .where(eq(answers.id, vote.answerId));
    }

    return true;
  }

  // Report operations (Admin only)
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  // Stats operations
  async getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }> {
    const [totalQuestions] = await db.select({ count: count() }).from(questions);
    const [solvedQuestions] = await db.select({ count: count() }).from(questions).where(eq(questions.solved, true));
    const [activeUsers] = await db.select({ count: count() }).from(users);

    return {
      totalQuestions: totalQuestions.count,
      solvedQuestions: solvedQuestions.count,
      activeUsers: activeUsers.count,
      avgResponseTime: "2.4h",
    };
  }
}

export const storage = new DatabaseStorage();

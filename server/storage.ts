import { Database } from "./database";
import { 
  type User, type InsertUser, 
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type Vote, type InsertVote 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  getVote(userId: number, questionId?: number, answerId?: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, type: string): Promise<Vote | undefined>;
  deleteVote(id: number): Promise<boolean>;
  
  // Stats methods
  getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }>;
}

export class SQLiteStorage implements IStorage {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  async getUser(id: number): Promise<User | undefined> {
    return await this.db.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.db.getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    return await this.db.createUser(user);
  }

  async getQuestions(filters?: {
    search?: string;
    software?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Question[]> {
    return await this.db.getQuestions(filters);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return await this.db.getQuestion(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    return await this.db.createQuestion(question);
  }

  async updateQuestion(id: number, updates: Partial<Question>): Promise<Question | undefined> {
    return await this.db.updateQuestion(id, updates);
  }

  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return await this.db.getAnswersByQuestionId(questionId);
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    return await this.db.createAnswer(answer);
  }

  async updateAnswer(id: number, updates: Partial<Answer>): Promise<Answer | undefined> {
    return await this.db.updateAnswer(id, updates);
  }

  async getVote(userId: number, questionId?: number, answerId?: number): Promise<Vote | undefined> {
    return await this.db.getVote(userId, questionId, answerId);
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    return await this.db.createVote(vote);
  }

  async updateVote(id: number, type: string): Promise<Vote | undefined> {
    return await this.db.updateVote(id, type);
  }

  async deleteVote(id: number): Promise<boolean> {
    return await this.db.deleteVote(id);
  }

  async getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }> {
    return await this.db.getStats();
  }
}

// Create storage instance
const storage = new SQLiteStorage();

// Initialize storage when the module is imported
let initPromise: Promise<void> | null = null;

export async function getStorage(): Promise<SQLiteStorage> {
  if (!initPromise) {
    initPromise = storage.initialize();
  }
  await initPromise;
  return storage;
}

export { storage };

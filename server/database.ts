import sqlite3 from "sqlite3";
import { promisify } from "util";
import { 
  type User, type InsertUser, 
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type Vote, type InsertVote 
} from "@shared/schema";

export class Database {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

  constructor(dbPath: string = "disisolves.db") {
    this.db = new sqlite3.Database(dbPath);
    
    // Promisify database methods with proper binding
    this.dbRun = (sql: string, params?: any[]) => {
      return new Promise<sqlite3.RunResult>((resolve, reject) => {
        this.db.run(sql, params || [], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };
    
    this.dbGet = (sql: string, params?: any[]) => {
      return new Promise<any>((resolve, reject) => {
        this.db.get(sql, params || [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };
    
    this.dbAll = (sql: string, params?: any[]) => {
      return new Promise<any[]>((resolve, reject) => {
        this.db.all(sql, params || [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    };
  }

  async initialize(): Promise<void> {
    // Create tables
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        software TEXT NOT NULL,
        operatingSystem TEXT,
        softwareVersion TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        authorId INTEGER NOT NULL,
        authorName TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        votes INTEGER NOT NULL DEFAULT 0,
        solved BOOLEAN NOT NULL DEFAULT 0,
        answersCount INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES users (id)
      )
    `);

    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        questionId INTEGER NOT NULL,
        content TEXT NOT NULL,
        authorId INTEGER NOT NULL,
        authorName TEXT NOT NULL,
        votes INTEGER NOT NULL DEFAULT 0,
        isAccepted BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionId) REFERENCES questions (id),
        FOREIGN KEY (authorId) REFERENCES users (id)
      )
    `);

    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        questionId INTEGER,
        answerId INTEGER,
        type TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (questionId) REFERENCES questions (id),
        FOREIGN KEY (answerId) REFERENCES answers (id),
        UNIQUE(userId, questionId, answerId)
      )
    `);

    // Create default user if not exists
    const existingUser = await this.dbGet("SELECT id FROM users WHERE username = ?", ["johndoe"]);
    if (!existingUser) {
      await this.dbRun(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        ["johndoe", "password"]
      );
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return await this.dbGet("SELECT * FROM users WHERE id = ?", [id]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.dbGet("SELECT * FROM users WHERE username = ?", [username]);
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.dbRun(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [user.username, user.password]
    );
    return await this.getUser(result.lastID) as User;
  }

  // Question methods
  async getQuestions(filters?: {
    search?: string;
    software?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Question[]> {
    let sql = "SELECT * FROM questions WHERE 1=1";
    const params: any[] = [];

    // Apply filters
    if (filters?.search) {
      sql += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters?.software && filters.software !== "all") {
      sql += " AND software = ?";
      params.push(filters.software);
    }

    if (filters?.status) {
      switch (filters.status) {
        case "solved":
          sql += " AND solved = 1";
          break;
        case "unsolved":
          sql += " AND solved = 0";
          break;
        case "no-answers":
          sql += " AND answersCount = 0";
          break;
      }
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "votes":
        sql += " ORDER BY votes DESC";
        break;
      case "answers":
        sql += " ORDER BY answersCount DESC";
        break;
      case "unsolved":
        sql += " ORDER BY solved ASC";
        break;
      default: // newest
        sql += " ORDER BY createdAt DESC";
    }

    // Apply pagination
    if (filters?.limit) {
      sql += " LIMIT ?";
      params.push(filters.limit);
    }
    if (filters?.offset) {
      sql += " OFFSET ?";
      params.push(filters.offset);
    }

    const results = await this.dbAll(sql, params);
    return results.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      solved: Boolean(row.solved),
      createdAt: new Date(row.createdAt)
    }));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const result = await this.dbGet("SELECT * FROM questions WHERE id = ?", [id]);
    if (!result) return undefined;
    
    return {
      ...result,
      tags: JSON.parse(result.tags || '[]'),
      solved: Boolean(result.solved),
      createdAt: new Date(result.createdAt)
    };
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await this.dbRun(`
      INSERT INTO questions (title, description, software, operatingSystem, softwareVersion, priority, authorId, authorName, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      question.title,
      question.description,
      question.software,
      question.operatingSystem,
      question.softwareVersion,
      question.priority,
      question.authorId,
      question.authorName,
      JSON.stringify(question.tags)
    ]);
    
    return await this.getQuestion(result.lastID) as Question;
  }

  async updateQuestion(id: number, updates: Partial<Question>): Promise<Question | undefined> {
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        fields.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (fields.length === 0) return await this.getQuestion(id);

    params.push(id);
    await this.dbRun(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`, params);
    return await this.getQuestion(id);
  }

  // Answer methods
  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    const results = await this.dbAll(`
      SELECT * FROM answers WHERE questionId = ? 
      ORDER BY isAccepted DESC, votes DESC, createdAt ASC
    `, [questionId]);
    
    return results.map(row => ({
      ...row,
      isAccepted: Boolean(row.isAccepted),
      createdAt: new Date(row.createdAt)
    }));
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const result = await this.dbRun(`
      INSERT INTO answers (questionId, content, authorId, authorName)
      VALUES (?, ?, ?, ?)
    `, [answer.questionId, answer.content, answer.authorId, answer.authorName]);

    // Update question answers count
    await this.dbRun(
      "UPDATE questions SET answersCount = answersCount + 1 WHERE id = ?",
      [answer.questionId]
    );

    const createdAnswer = await this.dbGet("SELECT * FROM answers WHERE id = ?", [result.lastID]);
    return {
      ...createdAnswer,
      isAccepted: Boolean(createdAnswer.isAccepted),
      createdAt: new Date(createdAnswer.createdAt)
    };
  }

  async updateAnswer(id: number, updates: Partial<Answer>): Promise<Answer | undefined> {
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      const result = await this.dbGet("SELECT * FROM answers WHERE id = ?", [id]);
      return result ? {
        ...result,
        isAccepted: Boolean(result.isAccepted),
        createdAt: new Date(result.createdAt)
      } : undefined;
    }

    params.push(id);
    await this.dbRun(`UPDATE answers SET ${fields.join(', ')} WHERE id = ?`, params);

    // If marking as accepted, unmark other answers for the same question
    if (updates.isAccepted) {
      const answer = await this.dbGet("SELECT questionId FROM answers WHERE id = ?", [id]);
      if (answer) {
        await this.dbRun(
          "UPDATE answers SET isAccepted = 0 WHERE questionId = ? AND id != ?",
          [answer.questionId, id]
        );
        
        // Mark question as solved
        await this.dbRun(
          "UPDATE questions SET solved = 1 WHERE id = ?",
          [answer.questionId]
        );
      }
    }

    const result = await this.dbGet("SELECT * FROM answers WHERE id = ?", [id]);
    return result ? {
      ...result,
      isAccepted: Boolean(result.isAccepted),
      createdAt: new Date(result.createdAt)
    } : undefined;
  }

  // Vote methods
  async getVote(userId: number, questionId?: number, answerId?: number): Promise<Vote | undefined> {
    let sql = "SELECT * FROM votes WHERE userId = ?";
    const params = [userId];

    if (questionId) {
      sql += " AND questionId = ?";
      params.push(questionId);
    } else {
      sql += " AND questionId IS NULL";
    }

    if (answerId) {
      sql += " AND answerId = ?";
      params.push(answerId);
    } else {
      sql += " AND answerId IS NULL";
    }

    return await this.dbGet(sql, params);
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const result = await this.dbRun(`
      INSERT INTO votes (userId, questionId, answerId, type)
      VALUES (?, ?, ?, ?)
    `, [vote.userId, vote.questionId, vote.answerId, vote.type]);

    // Update vote count
    const adjustment = vote.type === "up" ? 1 : -1;
    
    if (vote.questionId) {
      await this.dbRun(
        "UPDATE questions SET votes = votes + ? WHERE id = ?",
        [adjustment, vote.questionId]
      );
    }

    if (vote.answerId) {
      await this.dbRun(
        "UPDATE answers SET votes = votes + ? WHERE id = ?",
        [adjustment, vote.answerId]
      );
    }

    return await this.dbGet("SELECT * FROM votes WHERE id = ?", [result.lastID!]);
  }

  async updateVote(id: number, type: string): Promise<Vote | undefined> {
    const oldVote = await this.dbGet("SELECT * FROM votes WHERE id = ?", [id]);
    if (!oldVote) return undefined;

    const oldAdjustment = oldVote.type === "up" ? -1 : 1;
    const newAdjustment = type === "up" ? 1 : -1;
    const totalAdjustment = oldAdjustment + newAdjustment;

    await this.dbRun("UPDATE votes SET type = ? WHERE id = ?", [type, id]);

    // Update vote counts
    if (oldVote.questionId) {
      await this.dbRun(
        "UPDATE questions SET votes = votes + ? WHERE id = ?",
        [totalAdjustment, oldVote.questionId]
      );
    }

    if (oldVote.answerId) {
      await this.dbRun(
        "UPDATE answers SET votes = votes + ? WHERE id = ?",
        [totalAdjustment, oldVote.answerId]
      );
    }

    return await this.dbGet("SELECT * FROM votes WHERE id = ?", [id]);
  }

  async deleteVote(id: number): Promise<boolean> {
    const vote = await this.dbGet("SELECT * FROM votes WHERE id = ?", [id]);
    if (!vote) return false;

    await this.dbRun("DELETE FROM votes WHERE id = ?", [id]);

    // Update vote counts
    const adjustment = vote.type === "up" ? -1 : 1;
    
    if (vote.questionId) {
      await this.dbRun(
        "UPDATE questions SET votes = votes + ? WHERE id = ?",
        [adjustment, vote.questionId]
      );
    }

    if (vote.answerId) {
      await this.dbRun(
        "UPDATE answers SET votes = votes + ? WHERE id = ?",
        [adjustment, vote.answerId]
      );
    }

    return true;
  }

  // Stats methods
  async getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }> {
    const totalQuestions = await this.dbGet("SELECT COUNT(*) as count FROM questions");
    const solvedQuestions = await this.dbGet("SELECT COUNT(*) as count FROM questions WHERE solved = 1");
    const activeUsers = await this.dbGet("SELECT COUNT(*) as count FROM users");

    return {
      totalQuestions: totalQuestions.count,
      solvedQuestions: solvedQuestions.count,
      activeUsers: activeUsers.count,
      avgResponseTime: "2.4h",
    };
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
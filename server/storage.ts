import { 
  users, questions, answers, votes,
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private votes: Map<number, Vote>;
  private currentUserId: number;
  private currentQuestionId: number;
  private currentAnswerId: number;
  private currentVoteId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.votes = new Map();
    this.currentUserId = 1;
    this.currentQuestionId = 1;
    this.currentAnswerId = 1;
    this.currentVoteId = 1;

    // Create a default user
    this.users.set(1, {
      id: 1,
      username: "johndoe",
      password: "password",
    });
    this.currentUserId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(filters?: {
    search?: string;
    software?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Question[]> {
    let result = Array.from(this.questions.values());

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.software && filters.software !== "all") {
      result = result.filter(q => q.software === filters.software);
    }

    if (filters?.status) {
      switch (filters.status) {
        case "solved":
          result = result.filter(q => q.solved);
          break;
        case "unsolved":
          result = result.filter(q => !q.solved);
          break;
        case "no-answers":
          result = result.filter(q => q.answersCount === 0);
          break;
      }
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "votes":
        result.sort((a, b) => b.votes - a.votes);
        break;
      case "answers":
        result.sort((a, b) => b.answersCount - a.answersCount);
        break;
      case "unsolved":
        result.sort((a, b) => Number(a.solved) - Number(b.solved));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return result.slice(offset, offset + limit);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const question: Question = {
      ...insertQuestion,
      id,
      votes: 0,
      solved: false,
      answersCount: 0,
      createdAt: new Date(),
    };
    this.questions.set(id, question);
    return question;
  }

  async updateQuestion(id: number, updates: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;

    const updated = { ...question, ...updates };
    this.questions.set(id, updated);
    return updated;
  }

  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.questionId === questionId)
      .sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.votes - a.votes;
      });
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.currentAnswerId++;
    const answer: Answer = {
      ...insertAnswer,
      id,
      votes: 0,
      isAccepted: false,
      createdAt: new Date(),
    };
    this.answers.set(id, answer);

    // Update question answers count
    const question = this.questions.get(insertAnswer.questionId);
    if (question) {
      question.answersCount += 1;
      this.questions.set(question.id, question);
    }

    return answer;
  }

  async updateAnswer(id: number, updates: Partial<Answer>): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;

    const updated = { ...answer, ...updates };
    this.answers.set(id, updated);

    // If marking as accepted, unmark other answers for the same question
    if (updates.isAccepted) {
      const questionAnswers = await this.getAnswersByQuestionId(answer.questionId);
      questionAnswers.forEach(a => {
        if (a.id !== id && a.isAccepted) {
          this.answers.set(a.id, { ...a, isAccepted: false });
        }
      });

      // Mark question as solved
      const question = this.questions.get(answer.questionId);
      if (question) {
        this.questions.set(question.id, { ...question, solved: true });
      }
    }

    return updated;
  }

  async getVote(userId: number, questionId?: number, answerId?: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(vote =>
      vote.userId === userId &&
      vote.questionId === questionId &&
      vote.answerId === answerId
    );
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentVoteId++;
    const vote: Vote = { ...insertVote, id };
    this.votes.set(id, vote);

    // Update vote count
    if (vote.questionId) {
      const question = this.questions.get(vote.questionId);
      if (question) {
        const adjustment = vote.type === "up" ? 1 : -1;
        question.votes += adjustment;
        this.questions.set(question.id, question);
      }
    }

    if (vote.answerId) {
      const answer = this.answers.get(vote.answerId);
      if (answer) {
        const adjustment = vote.type === "up" ? 1 : -1;
        answer.votes += adjustment;
        this.answers.set(answer.id, answer);
      }
    }

    return vote;
  }

  async updateVote(id: number, type: string): Promise<Vote | undefined> {
    const vote = this.votes.get(id);
    if (!vote) return undefined;

    const oldType = vote.type;
    vote.type = type;
    this.votes.set(id, vote);

    // Update vote counts
    const adjustment = (oldType === "up" ? -1 : 1) + (type === "up" ? 1 : -1);
    
    if (vote.questionId) {
      const question = this.questions.get(vote.questionId);
      if (question) {
        question.votes += adjustment;
        this.questions.set(question.id, question);
      }
    }

    if (vote.answerId) {
      const answer = this.answers.get(vote.answerId);
      if (answer) {
        answer.votes += adjustment;
        this.answers.set(answer.id, answer);
      }
    }

    return vote;
  }

  async deleteVote(id: number): Promise<boolean> {
    const vote = this.votes.get(id);
    if (!vote) return false;

    this.votes.delete(id);

    // Update vote counts
    const adjustment = vote.type === "up" ? -1 : 1;
    
    if (vote.questionId) {
      const question = this.questions.get(vote.questionId);
      if (question) {
        question.votes += adjustment;
        this.questions.set(question.id, question);
      }
    }

    if (vote.answerId) {
      const answer = this.answers.get(vote.answerId);
      if (answer) {
        answer.votes += adjustment;
        this.answers.set(answer.id, answer);
      }
    }

    return true;
  }

  async getStats(): Promise<{
    totalQuestions: number;
    solvedQuestions: number;
    activeUsers: number;
    avgResponseTime: string;
  }> {
    const totalQuestions = this.questions.size;
    const solvedQuestions = Array.from(this.questions.values()).filter(q => q.solved).length;
    const activeUsers = this.users.size;

    return {
      totalQuestions,
      solvedQuestions,
      activeUsers,
      avgResponseTime: "2.4h",
    };
  }
}

export const storage = new MemStorage();

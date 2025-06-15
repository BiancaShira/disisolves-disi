import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertAnswerSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all questions with filters
  app.get("/api/questions", async (req, res) => {
    try {
      const {
        search,
        software,
        status,
        sortBy = "newest",
        limit = "20",
        offset = "0",
      } = req.query;

      const questions = await storage.getQuestions({
        search: search as string,
        software: software as string,
        status: status as string,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get single question
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Create new question
  app.post("/api/questions", async (req, res) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Get answers for a question
  app.get("/api/questions/:id/answers", async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const answers = await storage.getAnswersByQuestionId(questionId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  // Create new answer
  app.post("/api/answers", async (req, res) => {
    try {
      const validatedData = insertAnswerSchema.parse(req.body);
      const answer = await storage.createAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create answer" });
    }
  });

  // Accept answer
  app.patch("/api/answers/:id/accept", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const answer = await storage.updateAnswer(id, { isAccepted: true });
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      res.json(answer);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept answer" });
    }
  });

  // Vote on question or answer
  app.post("/api/votes", async (req, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Check if vote already exists
      const existingVote = await storage.getVote(
        validatedData.userId,
        validatedData.questionId,
        validatedData.answerId
      );

      if (existingVote) {
        if (existingVote.type === validatedData.type) {
          // Remove vote if same type
          await storage.deleteVote(existingVote.id);
          return res.json({ message: "Vote removed" });
        } else {
          // Update vote type
          const updatedVote = await storage.updateVote(existingVote.id, validatedData.type);
          return res.json(updatedVote);
        }
      } else {
        // Create new vote
        const vote = await storage.createVote(validatedData);
        res.status(201).json(vote);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process vote" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Search suggestions
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== "string") {
        return res.json([]);
      }

      const questions = await storage.getQuestions({ search: q as string, limit: 5 });
      const suggestions = questions.map(q => ({
        title: q.title,
        software: q.software,
        id: q.id,
      }));

      // Add software suggestions
      const softwareSuggestions = [
        "omniscan", "softtrac", "ibml-scanners", "database-tools", "network-tools"
      ].filter(s => s.includes((q as string).toLowerCase()));

      res.json({
        questions: suggestions,
        software: softwareSuggestions,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

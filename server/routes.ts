import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, requireAdmin, requireSupervisorOrAdmin, requireAnyRole } from "./localAuth";
import { insertQuestionSchema, insertAnswerSchema, insertVoteSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from public directory
  app.use('/public', express.static('public'));

  // Get all questions with filters (show only approved content to regular users)
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
        approvalStatus: 'approved' // Only show approved content to public
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

  // Create new question (requires auth - Users can only raise issues, Supervisors need approval)
  app.post("/api/questions", requireAnyRole, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        authorId: user.id,
        authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Anonymous",
        status: user.role === 'admin' ? 'approved' : (user.role === 'supervisor' ? 'pending' : 'approved') // Users can raise issues directly
      });
      
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

  // Create new answer (requires supervisor or admin - users cannot answer)
  app.post("/api/questions/:id/answers", requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const questionId = parseInt(req.params.id);
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        questionId,
        authorId: user.id,
        authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Anonymous",
        status: user.role === 'admin' ? 'approved' : 'pending'
      });
      
      const answer = await storage.createAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create answer" });
    }
  });

  // Update answer (requires admin)
  app.patch("/api/answers/:id", requireAdmin, async (req: any, res) => {
    try {
      const user = req.user;
      const id = parseInt(req.params.id);
      
      // Only allow admin or answer author to update
      // For simplicity, allowing any authenticated user for now
      const updatedAnswer = await storage.updateAnswer(id, req.body);
      
      if (!updatedAnswer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      res.json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update answer" });
    }
  });

  // Vote on question or answer (only admin and supervisor can vote)
  app.post("/api/vote", requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertVoteSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if user already voted
      const existingVote = await storage.getVote(
        userId,
        validatedData.questionId,
        validatedData.answerId
      );

      if (existingVote) {
        if (existingVote.type === validatedData.type) {
          // Remove vote if same type
          await storage.deleteVote(existingVote.id);
          res.json({ message: "Vote removed" });
        } else {
          // Update vote if different type
          const updatedVote = await storage.updateVote(existingVote.id, validatedData.type);
          res.json(updatedVote);
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

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ADMIN ROUTES
  // Get all reports (admin only)
  app.get("/api/admin/reports", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Create report (requires auth)
  app.post("/api/reports", requireAnyRole, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertReportSchema.parse({
        ...req.body,
        reportedBy: userId
      });
      
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Update report status (admin only)
  app.patch("/api/admin/reports/:id", requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      
      const updates = {
        ...req.body,
        resolvedBy: req.body.status === 'resolved' ? userId : undefined,
        resolvedAt: req.body.status === 'resolved' ? new Date() : undefined
      };
      
      const updatedReport = await storage.updateReport(id, updates);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(updatedReport);
    } catch (error) {
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Admin route to post solutions (admin only)
  app.post("/api/admin/solutions/:questionId", requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const questionId = parseInt(req.params.questionId);
      
      const validatedData = insertAnswerSchema.parse({
        ...req.body,
        questionId,
        authorId: userId,
        authorName: `${user?.firstName || 'Admin'} (Admin)`
      });
      
      const answer = await storage.createAnswer(validatedData);
      
      // Mark as accepted solution
      await storage.updateAnswer(answer.id, { isAccepted: true });
      
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid solution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to post solution" });
    }
  });

  // Admin: Get pending content for approval
  app.get("/api/admin/pending", requireAdmin, async (req, res) => {
    try {
      const pendingQuestions = await storage.getQuestions({ approvalStatus: 'pending', limit: 100 });
      const pendingAnswers = await storage.getAnswersByQuestionId(0); // Get all answers, then filter in code for now
      res.json({ 
        pendingQuestions,
        pendingAnswers: [] // TODO: Implement pending answers filter
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending content" });
    }
  });

  // Admin: Approve/reject questions
  app.patch("/api/admin/questions/:id/approval", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body; // 'approved' or 'rejected'
      const adminId = req.user.id;
      
      const updates = {
        status,
        approvedBy: status === 'approved' ? adminId : null,
        approvedAt: status === 'approved' ? new Date() : null
      };
      
      const updatedQuestion = await storage.updateQuestion(id, updates);
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question approval" });
    }
  });

  // Admin: Approve/reject answers  
  app.patch("/api/admin/answers/:id/approval", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body; // 'approved' or 'rejected'
      const adminId = req.user.id;
      
      const updates = {
        status,
        approvedBy: status === 'approved' ? adminId : null,
        approvedAt: status === 'approved' ? new Date() : null
      };
      
      const updatedAnswer = await storage.updateAnswer(id, updates);
      if (!updatedAnswer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      res.json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update answer approval" });
    }
  });

  // Admin analytics route
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      const questions = await storage.getQuestions({ limit: 100 });
      const reports = await storage.getReports();
      
      res.json({
        ...stats,
        recentQuestions: questions.slice(0, 10),
        pendingReports: reports.filter(r => r.status === 'pending').length,
        totalReports: reports.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
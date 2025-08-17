-- XAMPP MySQL Database Setup for Q&A System
-- Run this in phpMyAdmin SQL tab after creating 'qa_system' database

-- Create database (run this first if not already created)
CREATE DATABASE IF NOT EXISTS `qa_system`;
USE `qa_system`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(100),
  `lastName` VARCHAR(100),
  `role` ENUM('admin', 'supervisor', 'user') DEFAULT 'user',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `software` VARCHAR(100),
  `authorId` VARCHAR(36) NOT NULL,
  `authorName` VARCHAR(200),
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `approvedBy` VARCHAR(36),
  `approvedAt` TIMESTAMP NULL,
  `votes` INT DEFAULT 0,
  `answersCount` INT DEFAULT 0,
  `solved` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_software` (`software`),
  INDEX `idx_author` (`authorId`)
);

-- Answers table
CREATE TABLE IF NOT EXISTS `answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `content` TEXT NOT NULL,
  `questionId` INT NOT NULL,
  `authorId` VARCHAR(36) NOT NULL,
  `authorName` VARCHAR(200),
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `approvedBy` VARCHAR(36),
  `approvedAt` TIMESTAMP NULL,
  `votes` INT DEFAULT 0,
  `isAccepted` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_question` (`questionId`),
  INDEX `idx_author` (`authorId`),
  INDEX `idx_status` (`status`)
);

-- Reports table
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('question', 'answer') NOT NULL,
  `itemId` INT NOT NULL,
  `reason` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `reportedBy` VARCHAR(36) NOT NULL,
  `status` ENUM('open', 'resolved', 'dismissed') DEFAULT 'open',
  `resolvedBy` VARCHAR(36),
  `resolvedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type_item` (`type`, `itemId`),
  INDEX `idx_status` (`status`)
);

-- Votes table
CREATE TABLE IF NOT EXISTS `votes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL,
  `questionId` INT,
  `answerId` INT,
  `type` ENUM('up', 'down') NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_question_vote` (`userId`, `questionId`),
  UNIQUE KEY `unique_answer_vote` (`userId`, `answerId`),
  INDEX `idx_user` (`userId`)
);

-- Insert default users (password is 'password123' hashed with bcrypt)
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `role`) VALUES
('admin-001', 'admin@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Admin', 'User', 'admin'),
('supervisor-001', 'supervisor@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Supervisor', 'User', 'supervisor'),
('user-001', 'user@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Regular', 'User', 'user');

-- Insert sample questions
INSERT IGNORE INTO `questions` (`id`, `title`, `description`, `software`, `authorId`, `authorName`, `status`, `votes`, `answersCount`, `solved`) VALUES
(1, 'Omniscan barcode reader not scanning properly', 'The barcode scanner connected to our Omniscan workstation is not reading barcodes consistently. It works sometimes but fails on certain types of labels.', 'omniscan', 'admin-001', 'Admin User', 'approved', 3, 1, TRUE),
(2, 'SoftTrac database connection timeout', 'Getting frequent timeout errors when trying to connect to the SoftTrac database. This happens especially during peak hours.', 'softtrac', 'supervisor-001', 'Supervisor User', 'approved', 2, 0, FALSE),
(3, 'IBML scanner driver compatibility issues', 'After Windows update, the IBML scanner drivers are not working properly. Scanner is detected but cannot initialize scanning process.', 'ibml-scanners', 'user-001', 'Regular User', 'approved', 1, 0, FALSE),
(4, 'Export function not working in reporting module', 'When trying to export reports to Excel format, the system throws an error and the export fails. PDF export works fine.', 'softtrac', 'admin-001', 'Admin User', 'approved', 0, 0, FALSE);

-- Insert sample answers
INSERT IGNORE INTO `answers` (`id`, `content`, `questionId`, `authorId`, `authorName`, `status`, `votes`, `isAccepted`) VALUES
(1, 'This is usually caused by incorrect scanner settings. Try adjusting the scan sensitivity in the Omniscan configuration panel. Go to Settings > Scanner Configuration > Sensitivity and increase it to 75%. Also ensure the barcode labels are clean and properly aligned.', 1, 'admin-001', 'Admin User', 'approved', 2, TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_questions_created` ON `questions` (`createdAt` DESC);
CREATE INDEX IF NOT EXISTS `idx_answers_created` ON `answers` (`createdAt` DESC);
CREATE INDEX IF NOT EXISTS `idx_questions_votes` ON `questions` (`votes` DESC);

-- Show tables created
SHOW TABLES;

-- Display user accounts for reference
SELECT id, email, role, firstName, lastName FROM users;

-- Display sample data
SELECT id, title, software, status, votes, answersCount, solved FROM questions;
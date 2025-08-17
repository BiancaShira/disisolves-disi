import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// XAMPP MySQL Configuration
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // XAMPP default has no password for root
  database: process.env.DB_NAME || 'qa_system',
  ssl: false // XAMPP doesn't use SSL by default
};

console.log('MySQL Connection Config:', {
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  database: connectionConfig.database
});

export const mysqlPool = mysql.createPool(connectionConfig);
export const mysqlDb = drizzle(mysqlPool, { schema, mode: 'default' });

// Function to initialize database and tables
export async function initializeMySQLDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password,
      ssl: false
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${connectionConfig.database}\``);
    console.log(`MySQL Database '${connectionConfig.database}' created/connected successfully`);
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize MySQL database:', error);
    return false;
  }
}

// SQL to create tables manually if needed
export const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('admin', 'supervisor', 'user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  software VARCHAR(100),
  authorId VARCHAR(36) NOT NULL,
  authorName VARCHAR(200),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approvedBy VARCHAR(36),
  approvedAt TIMESTAMP NULL,
  votes INT DEFAULT 0,
  answersCount INT DEFAULT 0,
  solved BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  questionId INT NOT NULL,
  authorId VARCHAR(36) NOT NULL,
  authorName VARCHAR(200),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approvedBy VARCHAR(36),
  approvedAt TIMESTAMP NULL,
  votes INT DEFAULT 0,
  isAccepted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (questionId) REFERENCES questions(id),
  FOREIGN KEY (authorId) REFERENCES users(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('question', 'answer') NOT NULL,
  itemId INT NOT NULL,
  reason VARCHAR(200) NOT NULL,
  description TEXT,
  reportedBy VARCHAR(36) NOT NULL,
  status ENUM('open', 'resolved', 'dismissed') DEFAULT 'open',
  resolvedBy VARCHAR(36),
  resolvedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reportedBy) REFERENCES users(id),
  FOREIGN KEY (resolvedBy) REFERENCES users(id)
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  questionId INT,
  answerId INT,
  type ENUM('up', 'down') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (questionId) REFERENCES questions(id),
  FOREIGN KEY (answerId) REFERENCES answers(id),
  UNIQUE KEY unique_question_vote (userId, questionId),
  UNIQUE KEY unique_answer_vote (userId, answerId)
);

-- Insert default users
INSERT IGNORE INTO users (id, email, password, firstName, lastName, role) VALUES
('admin-001', 'admin@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Admin', 'User', 'admin'),
('supervisor-001', 'supervisor@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Supervisor', 'User', 'supervisor'),
('user-001', 'user@company.com', '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a', 'Regular', 'User', 'user');
`;
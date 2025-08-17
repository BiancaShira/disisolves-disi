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

export const mysqlConnection = mysql.createConnection(connectionConfig);
export const mysqlDb = drizzle(mysqlConnection, { schema, mode: 'default' });

// Function to initialize database and tables
export async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password,
      ssl: false
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`);
    await connection.execute(`USE ${connectionConfig.database}`);
    
    console.log(`Database '${connectionConfig.database}' created/connected successfully`);
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
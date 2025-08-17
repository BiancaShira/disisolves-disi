// XAMPP Migration Script - Run this to migrate from PostgreSQL to MySQL
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qa_system',
  ssl: false
};

export async function migrateDatabaseToMySQL() {
  console.log('🔄 Starting migration to XAMPP MySQL...');
  
  try {
    // Create connection
    const connection = await mysql.createConnection(mysqlConfig);
    
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``);
    await connection.execute(`USE \`${mysqlConfig.database}\``);
    
    console.log('✅ Database created/connected');
    
    // Create tables
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) PRIMARY KEY,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`firstName\` VARCHAR(100),
        \`lastName\` VARCHAR(100),
        \`role\` ENUM('admin', 'supervisor', 'user') DEFAULT 'user',
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Questions table
      `CREATE TABLE IF NOT EXISTS \`questions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(500) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`software\` VARCHAR(100),
        \`authorId\` VARCHAR(36) NOT NULL,
        \`authorName\` VARCHAR(200),
        \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        \`approvedBy\` VARCHAR(36),
        \`approvedAt\` TIMESTAMP NULL,
        \`votes\` INT DEFAULT 0,
        \`answersCount\` INT DEFAULT 0,
        \`solved\` BOOLEAN DEFAULT FALSE,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_software\` (\`software\`),
        INDEX \`idx_author\` (\`authorId\`)
      )`,
      
      // Answers table
      `CREATE TABLE IF NOT EXISTS \`answers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`content\` TEXT NOT NULL,
        \`questionId\` INT NOT NULL,
        \`authorId\` VARCHAR(36) NOT NULL,
        \`authorName\` VARCHAR(200),
        \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
        \`approvedBy\` VARCHAR(36),
        \`approvedAt\` TIMESTAMP NULL,
        \`votes\` INT DEFAULT 0,
        \`isAccepted\` BOOLEAN DEFAULT FALSE,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_question\` (\`questionId\`),
        INDEX \`idx_author\` (\`authorId\`),
        INDEX \`idx_status\` (\`status\`)
      )`,
      
      // Reports table
      `CREATE TABLE IF NOT EXISTS \`reports\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`type\` ENUM('question', 'answer') NOT NULL,
        \`itemId\` INT NOT NULL,
        \`reason\` VARCHAR(200) NOT NULL,
        \`description\` TEXT,
        \`reportedBy\` VARCHAR(36) NOT NULL,
        \`status\` ENUM('open', 'resolved', 'dismissed') DEFAULT 'open',
        \`resolvedBy\` VARCHAR(36),
        \`resolvedAt\` TIMESTAMP NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_type_item\` (\`type\`, \`itemId\`),
        INDEX \`idx_status\` (\`status\`)
      )`,
      
      // Votes table
      `CREATE TABLE IF NOT EXISTS \`votes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` VARCHAR(36) NOT NULL,
        \`questionId\` INT,
        \`answerId\` INT,
        \`type\` ENUM('up', 'down') NOT NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_question_vote\` (\`userId\`, \`questionId\`),
        UNIQUE KEY \`unique_answer_vote\` (\`userId\`, \`answerId\`),
        INDEX \`idx_user\` (\`userId\`)
      )`
    ];
    
    for (const tableSQL of tables) {
      await connection.execute(tableSQL);
    }
    
    console.log('✅ Tables created');
    
    // Hash password for default users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert default users
    const defaultUsers = [
      ['admin-001', 'admin@company.com', hashedPassword, 'Admin', 'User', 'admin'],
      ['supervisor-001', 'supervisor@company.com', hashedPassword, 'Supervisor', 'User', 'supervisor'],
      ['user-001', 'user@company.com', hashedPassword, 'Regular', 'User', 'user']
    ];
    
    for (const user of defaultUsers) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `role`) VALUES (?, ?, ?, ?, ?, ?)',
          user
        );
      } catch (error) {
        console.log(`User ${user[1]} already exists, skipping...`);
      }
    }
    
    console.log('✅ Default users created');
    
    // Insert sample questions
    const sampleQuestions = [
      [1, 'Omniscan barcode reader not scanning properly', 'The barcode scanner connected to our Omniscan workstation is not reading barcodes consistently. It works sometimes but fails on certain types of labels.', 'omniscan', 'admin-001', 'Admin User', 'approved', 3, 1, true],
      [2, 'SoftTrac database connection timeout', 'Getting frequent timeout errors when trying to connect to the SoftTrac database. This happens especially during peak hours.', 'softtrac', 'supervisor-001', 'Supervisor User', 'approved', 2, 0, false],
      [3, 'IBML scanner driver compatibility issues', 'After Windows update, the IBML scanner drivers are not working properly. Scanner is detected but cannot initialize scanning process.', 'ibml-scanners', 'user-001', 'Regular User', 'approved', 1, 0, false],
      [4, 'Export function not working in reporting module', 'When trying to export reports to Excel format, the system throws an error and the export fails. PDF export works fine.', 'softtrac', 'admin-001', 'Admin User', 'approved', 0, 0, false]
    ];
    
    for (const question of sampleQuestions) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO `questions` (`id`, `title`, `description`, `software`, `authorId`, `authorName`, `status`, `votes`, `answersCount`, `solved`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          question
        );
      } catch (error) {
        console.log(`Question ${question[0]} already exists, skipping...`);
      }
    }
    
    console.log('✅ Sample questions created');
    
    // Insert sample answer
    try {
      await connection.execute(
        'INSERT IGNORE INTO `answers` (`id`, `content`, `questionId`, `authorId`, `authorName`, `status`, `votes`, `isAccepted`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [1, 'This is usually caused by incorrect scanner settings. Try adjusting the scan sensitivity in the Omniscan configuration panel. Go to Settings > Scanner Configuration > Sensitivity and increase it to 75%. Also ensure the barcode labels are clean and properly aligned.', 1, 'admin-001', 'Admin User', 'approved', 2, true]
      );
    } catch (error) {
      console.log('Sample answer already exists, skipping...');
    }
    
    console.log('✅ Sample answer created');
    
    await connection.end();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Default Accounts:');
    console.log('   Admin: admin@company.com (password: password123)');
    console.log('   Supervisor: supervisor@company.com (password: password123)');
    console.log('   User: user@company.com (password: password123)');
    console.log('\n🌐 Access your application at: http://localhost:5000');
    console.log('🗄️  Access phpMyAdmin at: http://localhost/phpmyadmin');
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabaseToMySQL()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
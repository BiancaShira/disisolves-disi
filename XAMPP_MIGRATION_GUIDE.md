# Complete XAMPP Migration Guide for Q&A System

## Overview
This guide will help you migrate the Q&A system from PostgreSQL to XAMPP MySQL, giving you full control over your database through phpMyAdmin.

## Prerequisites
1. **XAMPP Installed**: Download from https://www.apachefriends.org/
2. **Node.js**: Version 18 or higher
3. **Git**: For version control (optional)

## Step 1: Install and Configure XAMPP

### 1.1 Download and Install XAMPP
1. Go to https://www.apachefriends.org/download.html
2. Download XAMPP for your operating system
3. Install with default settings
4. Start XAMPP Control Panel

### 1.2 Start Required Services
In XAMPP Control Panel, start:
- ✅ **Apache** (for web server and phpMyAdmin)
- ✅ **MySQL** (for database)

### 1.3 Verify Installation
1. Open browser and go to `http://localhost/phpmyadmin`
2. You should see the phpMyAdmin interface
3. Default login is usually no username/password required

## Step 2: Configure Environment

### 2.1 Create Environment File
Create a `.env` file in your project root:

```env
# XAMPP MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=qa_system

# Session Configuration
SESSION_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 2.2 Install MySQL Dependencies
The mysql2 package is already installed. If you need to reinstall:
```bash
npm install mysql2
```

## Step 3: Database Setup

### Option A: Automatic Setup (Recommended)
1. Run the migration script:
```bash
npm run migrate:xampp
```

This will:
- Create the database
- Create all tables
- Insert default users
- Insert sample data

### Option B: Manual Setup via phpMyAdmin
1. Open `http://localhost/phpmyadmin`
2. Click "New" to create a database
3. Enter database name: `qa_system`
4. Click "Create"
5. Go to SQL tab and copy-paste contents from `xampp-setup.sql`
6. Click "Go" to execute

## Step 4: Update Application Configuration

### 4.1 Modify Database Connection
The application is already configured to work with both PostgreSQL and MySQL. To switch to MySQL:

1. Update your `.env` file with XAMPP settings (Step 2.1)
2. The app will automatically detect and use MySQL

### 4.2 Test Connection
Start the application:
```bash
npm run dev
```

You should see:
```
MySQL Connection Config: { host: 'localhost', port: 3306, user: 'root', database: 'qa_system' }
Database 'qa_system' created/connected successfully
express serving on port 5000
```

## Step 5: Access and Test

### 5.1 Application Access
- **Application**: http://localhost:5000
- **Login Page**: http://localhost:5000/login
- **Admin Dashboard**: http://localhost:5000/admin (admin only)

### 5.2 Test Accounts
All accounts use password: `password123`

| Role | Email | Permissions |
|------|-------|-------------|
| **Admin** | admin@company.com | Full access, approve content, admin dashboard |
| **Supervisor** | supervisor@company.com | Post questions/answers (needs approval) |
| **User** | user@company.com | View content, raise issues only |

### 5.3 Database Management
- **phpMyAdmin**: http://localhost/phpmyadmin
- Select `qa_system` database from left sidebar
- Browse tables: users, questions, answers, reports, votes

## Step 6: Customizing Your Database

### 6.1 Adding Users
In phpMyAdmin:
1. Go to `qa_system` > `users` table
2. Click "Insert" tab
3. Add new user with:
   - `id`: Unique identifier (e.g., 'custom-001')
   - `email`: User's email
   - `password`: Use bcrypt hash (see password hashing section)
   - `role`: 'admin', 'supervisor', or 'user'

### 6.2 Managing Questions
1. Go to `questions` table
2. You can:
   - Edit existing questions
   - Add new questions
   - Change approval status
   - Modify vote counts

### 6.3 Password Hashing
To create password hashes for new users:
```javascript
// In Node.js console or script
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash); // Use this in the database
```

## Step 7: Production Considerations

### 7.1 Security
- Change MySQL root password:
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'your-strong-password';
  ```
- Update `.env` file with new password
- Use strong session secret in production

### 7.2 Backup
Regular backups via phpMyAdmin:
1. Go to `qa_system` database
2. Click "Export" tab
3. Choose "Quick" export method
4. Click "Go" to download SQL backup

### 7.3 Performance
For better performance with large datasets:
- Add indexes to frequently queried columns
- Consider enabling MySQL query cache
- Monitor slow queries in phpMyAdmin

## Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Ensure XAMPP MySQL service is running
- Check `.env` configuration
- Verify database exists in phpMyAdmin

**2. "Database 'qa_system' doesn't exist"**
- Create database manually in phpMyAdmin
- Run migration script again

**3. "Access denied for user 'root'"**
- Check if MySQL password is set
- Update `.env` file with correct credentials

**4. "Port 3306 already in use"**
- Another MySQL service might be running
- Stop other MySQL services or change port

**5. "Application shows login page but can't login"**
- Verify users table has data
- Check if bcrypt passwords are properly hashed
- Ensure session secret is set

### Useful SQL Queries

**Check user accounts:**
```sql
SELECT id, email, role, firstName, lastName FROM users;
```

**View question statistics:**
```sql
SELECT software, COUNT(*) as count, 
       SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved
FROM questions 
GROUP BY software;
```

**Reset user password:**
```sql
UPDATE users 
SET password = '$2b$10$rQJ7qFB1bF.GKqVkd4vFjuh9JdO.D.wL5vqGqxF.j2nJz0tHqrV1a' 
WHERE email = 'user@example.com';
-- Password is now 'password123'
```

## Development Workflow

### 1. Making Database Changes
1. Modify tables in phpMyAdmin
2. Test changes in the application
3. Export updated schema for version control

### 2. Adding New Features
1. Update database schema if needed
2. Modify application code
3. Test with your XAMPP database
4. Document changes

### 3. Data Management
- Use phpMyAdmin for complex queries
- Export data before major changes
- Keep regular backups

## Support

If you encounter issues:
1. Check XAMPP error logs in XAMPP Control Panel
2. Verify database connection in application logs
3. Test database connectivity in phpMyAdmin
4. Ensure all services are running in XAMPP

Your Q&A system is now fully configured with XAMPP MySQL! You have complete control over your database through phpMyAdmin and can customize it as needed.
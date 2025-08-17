# XAMPP Setup Instructions for Q&A Application

## 1. Install and Setup XAMPP

1. **Download XAMPP**: Go to https://www.apachefriends.org/download.html
2. **Install XAMPP**: Follow the installation wizard
3. **Start Services**: Open XAMPP Control Panel and start:
   - Apache (for web server)
   - MySQL (for database)

## 2. Create Database in phpMyAdmin

1. **Open phpMyAdmin**: In your browser, go to `http://localhost/phpmyadmin`
2. **Login**: Usually no password required for local XAMPP
3. **Create Database**: 
   - Click "New" in the left sidebar
   - Enter database name: `qa_system`
   - Click "Create"

## 3. Configure Environment Variables

Create a `.env` file in your project root with these settings:

```env
# XAMPP MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=qa_system

# Session Configuration
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## 4. Database Tables Setup

The application will automatically create these tables when you run it:

### Users Table
- **id**: Primary key (auto-increment)
- **email**: User email (unique)
- **password**: Hashed password
- **firstName**: User's first name
- **lastName**: User's last name
- **role**: 'admin', 'supervisor', or 'user'
- **createdAt**: Registration timestamp
- **updatedAt**: Last update timestamp

### Questions Table
- **id**: Primary key (auto-increment)
- **title**: Question title
- **description**: Question details
- **software**: Related software/category
- **authorId**: Foreign key to users table
- **authorName**: Display name of author
- **status**: 'pending', 'approved', 'rejected'
- **approvedBy**: Admin who approved (if applicable)
- **approvedAt**: Approval timestamp
- **votes**: Number of votes
- **answersCount**: Number of answers
- **solved**: Boolean for solved status
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

### Answers Table
- **id**: Primary key (auto-increment)
- **content**: Answer content
- **questionId**: Foreign key to questions table
- **authorId**: Foreign key to users table
- **authorName**: Display name of author
- **status**: 'pending', 'approved', 'rejected'
- **approvedBy**: Admin who approved (if applicable)
- **approvedAt**: Approval timestamp
- **votes**: Number of votes
- **isAccepted**: Boolean for accepted answer
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

### Reports Table
- **id**: Primary key (auto-increment)
- **type**: 'question' or 'answer'
- **itemId**: ID of reported item
- **reason**: Report reason
- **description**: Additional details
- **reportedBy**: User who reported
- **status**: 'open', 'resolved', 'dismissed'
- **resolvedBy**: Admin who resolved
- **resolvedAt**: Resolution timestamp
- **createdAt**: Creation timestamp

### Votes Table
- **id**: Primary key (auto-increment)
- **userId**: Foreign key to users table
- **questionId**: Foreign key to questions table (nullable)
- **answerId**: Foreign key to answers table (nullable)
- **type**: 'up' or 'down'
- **createdAt**: Creation timestamp

## 5. How to Run the Application

1. **Start XAMPP**: Make sure Apache and MySQL are running
2. **Install Dependencies**: Run `npm install` in your project directory
3. **Start Application**: Run `npm run dev`
4. **Access Application**: Open `http://localhost:5000` in your browser

## 6. Default User Accounts

The application comes with three pre-configured accounts:

- **Admin**: admin@company.com (Password: password123)
- **Supervisor**: supervisor@company.com (Password: password123)  
- **User**: user@company.com (Password: password123)

## 7. Viewing/Editing Database in phpMyAdmin

1. **Access phpMyAdmin**: Go to `http://localhost/phpmyadmin`
2. **Select Database**: Click on `qa_system` in the left sidebar
3. **View Tables**: You'll see all the tables listed
4. **Edit Data**: 
   - Click on any table name to view its data
   - Use "Insert" tab to add new records
   - Use "Browse" tab to view existing records
   - Click "Edit" next to any record to modify it

## 8. Important Role Permissions

- **Admin**: Can approve/reject all content, access admin dashboard at `/admin`
- **Supervisor**: Can post questions and answers (require admin approval)
- **User**: Can only view approved content and raise issues/reports

## 9. Troubleshooting

- **Connection Failed**: Check if XAMPP MySQL is running
- **Database Not Found**: Make sure you created `qa_system` database
- **Permission Denied**: Check XAMPP permissions and firewall settings
- **Port Conflicts**: Make sure port 3306 (MySQL) and 5000 (App) are available

## 10. Security Notes for Production

- Change default MySQL password
- Use strong session secrets
- Configure proper firewall rules
- Use SSL certificates
- Backup database regularly
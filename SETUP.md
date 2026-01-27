# TalentScan Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root package (concurrently)
- Server (Express, MongoDB, etc.)
- Client (React, Vite, Tailwind, etc.)

### 2. Configure Environment

Create `server/.env` file with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentscan
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

**Option 1: Run both client and server together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## First Time Setup

1. **Register an Admin User**

   Visit http://localhost:3000/register and create your first account.
   
   To make it an admin, you'll need to either:
   - Manually update the database: `db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})`
   - Or register through the API with admin role (if you have admin access)

2. **Create Your First Job**

   - Login to the application
   - Navigate to "Create Job"
   - Fill in job details and required skills
   - Save the job

3. **Upload Resumes**

   - Go to the job page
   - Click "Upload Resume"
   - Select a PDF resume file
   - The system will automatically parse and extract information

4. **Calculate Scores**

   - After uploading, review the parsed resume
   - Click "Calculate ATS Score"
   - View rankings to see candidate scores

## Troubleshooting

### MongoDB Connection Error

If you see MongoDB connection errors:

1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check the connection string in `server/.env`
3. For cloud MongoDB (MongoDB Atlas), update `MONGODB_URI` with your connection string

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change `PORT` in `server/.env`
2. Update `vite.config.js` in client folder for frontend port

### PDF Parsing Errors

- Ensure PDFs are text-based (not scanned images)
- Check file size (max 10MB)
- Verify PDF is not corrupted

### Build Errors

If you encounter build errors:

1. Delete `node_modules` folders
2. Delete `package-lock.json` files
3. Run `npm run install-all` again

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure MongoDB connection string for production database
4. Build frontend: `cd client && npm run build`
5. Serve frontend build with a web server (nginx, Apache, etc.)
6. Use PM2 or similar for Node.js process management

## Support

For issues or questions, check the main README.md file.


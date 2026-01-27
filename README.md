# TalentScan - Smart Resume Screening System

A production-grade SaaS application for automated resume screening and candidate ranking using ATS (Applicant Tracking System) scoring.

## Features

- **Resume Parsing**: Automatically extract skills, experience, and education from PDF resumes
- **ATS Scoring**: Calculate candidate scores based on skill match (60%), experience (25%), and education (15%)
- **Smart Ranking**: Automatically rank candidates by ATS score
- **Job Management**: Create and manage job postings with skill requirements
- **Role-Based Access**: Admin and Recruiter roles with appropriate permissions
- **Reports & Export**: Export candidate data to CSV
- **Audit Logging**: Track all platform activities

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- Chart.js for analytics
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- PDF parsing (pdf-parse)

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                 # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middlewares/       # Auth & audit middlewares
│   └── utils/             # Helper functions
│
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud instance)

### Installation

1. **Install dependencies:**
```bash
npm run install-all
```

2. **Configure environment variables:**

Create `server/.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentscan
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. **Start MongoDB:**
```bash
# Make sure MongoDB is running on your system
```

4. **Run the application:**

Development mode (both client and server):
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Resumes
- `POST /api/resumes/upload` - Upload resume (multipart/form-data)
- `GET /api/resumes/job/:jobId` - Get resumes for a job
- `GET /api/resumes/:id` - Get single resume
- `DELETE /api/resumes/:id` - Delete resume

### Scoring
- `POST /api/score/:resumeId` - Calculate ATS score
- `GET /api/score/:resumeId` - Get score for resume

### Rankings
- `GET /api/rankings/:jobId` - Get candidate rankings

### Admin
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs` - Get all jobs (admin view)
- `GET /api/admin/audit-logs` - Get audit logs
- `DELETE /api/admin/users/:id` - Delete user

## User Roles

### Admin
- Manage all users
- View all jobs and resumes
- Access platform analytics
- View audit logs

### Recruiter
- Create and manage own jobs
- Upload resumes
- View ATS rankings
- Export reports

## ATS Scoring Algorithm

The ATS score is calculated using weighted components:

- **Skill Match (60%)**: Percentage of required skills found in resume
- **Experience Match (25%)**: Match between candidate experience and required level
- **Education Match (15%)**: Education level assessment

Final Score = (Skill Score × 0.60) + (Experience Score × 0.25) + (Education Score × 0.15)

## Notes

- Only PDF files are accepted for resume uploads
- Maximum file size: 10MB
- Duplicate resume detection is implemented
- Image-based PDFs are rejected (text-based PDFs required)
- Skill matching includes synonym support (e.g., JS = JavaScript)

## License

ISC


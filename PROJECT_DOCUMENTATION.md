# TalentScan AI - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [How ATS Scoring Works](#how-ats-scoring-works)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Key Features](#key-features)
9. [How It Works - Step by Step](#how-it-works---step-by-step)
10. [Installation & Setup](#installation--setup)

---

## 🎯 Project Overview

**TalentScan AI** is a modern, AI-powered resume analyzer designed for **job seekers**. It helps users:
- Upload and analyze their resumes
- Get ATS (Applicant Tracking System) compatibility scores
- Receive AI-powered feedback and improvement suggestions
- Track resume performance over time
- Get job matching recommendations

**Type**: Full-stack web application (MERN Stack)  
**Purpose**: AI Resume Analyzer for Job Seekers  
**Deployment**: Monorepo structure (Client + Server)

---

## 💻 Technology Stack

### **Frontend**
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.1
- **Styling**: Tailwind CSS 3.3.6
- **Animations**: Framer Motion 10.18.0
- **Charts**: Chart.js 4.4.0 + React-Chartjs-2 5.2.0
- **HTTP Client**: Axios 1.6.2

### **Backend**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5
- **PDF Parsing**: pdf-parse 1.1.1
- **CORS**: cors 2.8.5
- **Validation**: express-validator 7.0.1

### **Development Tools**
- **Package Manager**: npm
- **Concurrent Execution**: concurrently 8.2.2
- **Environment Variables**: dotenv 16.3.1

---

## 🏗️ Project Architecture

```
Smart Resume/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/     # API service layer
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── controllers/       # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middlewares/       # Auth, validation, etc.
│   ├── utils/            # Helper functions
│   └── server.js         # Entry point
│
└── package.json           # Root package.json
```

---

## 🎯 How ATS Scoring Works

### **Overview**
The ATS (Applicant Tracking System) score is calculated using a **weighted algorithm** that evaluates three key aspects of a resume:

### **Scoring Formula**
```
Final ATS Score = (Skill Score × 60%) + (Experience Score × 25%) + (Education Score × 15%)
```

### **1. Skill Score (60% Weight)**

**How it works:**
- Extracts skills from the resume text using pattern matching
- Compares resume skills against job requirements (if jobId provided)
- Uses skill synonyms mapping (e.g., "js" = "javascript" = "ecmascript")
- Calculates match percentage based on required skills found

**Algorithm:**
```javascript
Skill Score = (Matched Skills Weight / Total Required Skills Weight) × 100
```

**Features:**
- Supports weighted skills (some skills more important than others)
- Handles skill synonyms (React = ReactJS = React.js)
- Case-insensitive matching
- Normalizes skill names (removes special characters)

### **2. Experience Score (25% Weight)**

**How it works:**
- Extracts years of experience from resume text
- Uses regex patterns to find experience mentions:
  - `"5+ years of experience"`
  - `"Experience: 3 years"`
- Compares against job requirement (entry/mid/senior/executive)
- Maps experience levels:
  - Entry: 0 years
  - Mid: 2 years
  - Senior: 5 years
  - Executive: 10 years

**Scoring Logic:**
- If candidate has ≥ required years: **100 points**
- If candidate has < required years: **Partial score** (percentage + 20 bonus)
- Entry level: Always 100 (any experience is fine)

### **3. Education Score (15% Weight)**

**How it works:**
- Extracts education information from resume
- Searches for education keywords:
  - Bachelor, Master, PhD, Degree, Diploma, etc.
- Assigns scores based on education level:
  - PhD/Doctorate: **100 points**
  - Master/MBA/MS: **90 points**
  - Bachelor/BSc/BA/BS: **80 points**
  - Diploma/Degree: **60 points**
  - Other: **50 points**
  - No education: **30 points**

### **General Scoring (For Job Seekers Without Job Posting)**

When no `jobId` is provided, the system uses **general scoring**:

```javascript
Skill Score = min(100, (Number of Skills × 8))  // More skills = higher score
Experience Score = 85 if experience found, else 50
Education Score = 90 if education found, else 50
```

### **Skill Detection Process**

1. **PDF Parsing**: Extracts text from PDF using `pdf-parse`
2. **Text Normalization**: Cleans text (removes special chars, normalizes spaces)
3. **Pattern Matching**: Uses regex to find skill mentions
4. **Synonym Matching**: Checks against skill synonyms dictionary
5. **Skill Extraction**: Returns array of detected skills

**Example Skill Synonyms:**
```javascript
'javascript' → ['javascript', 'js', 'ecmascript']
'react' → ['react', 'reactjs', 'react.js']
'node' → ['node', 'nodejs', 'node.js']
'sql' → ['sql', 'mysql', 'postgresql', 'mongodb', 'database']
```

---

## 🗄️ Database Models

### **1. User Model**
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  role: String (enum: ['admin', 'recruiter', 'jobseeker'], default: 'jobseeker'),
  createdAt: Date
}
```

### **2. Resume Model**
```javascript
{
  jobId: ObjectId (optional, ref: 'Job'),
  candidateName: String (optional),
  candidateEmail: String (optional),
  candidatePhone: String (optional),
  fileName: String (required),
  filePath: String (required),
  parsedText: String (required),
  extractedSkills: [String],
  extractedEducation: [String],
  extractedExperience: String,
  uploadedBy: ObjectId (required, ref: 'User'),
  status: String (enum: ['pending', 'parsed', 'scored', 'error']),
  createdAt: Date
}
```

### **3. Score Model**
```javascript
{
  resumeId: ObjectId (required, ref: 'Resume', unique),
  jobId: ObjectId (optional, ref: 'Job'),
  skillScore: Number (0-100),
  experienceScore: Number (0-100),
  educationScore: Number (0-100),
  finalScore: Number (0-100),
  missingSkills: [String],
  matchedSkills: [String],
  scoreBreakdown: Object,
  calculatedAt: Date
}
```

### **4. Job Model** (For future job matching)
```javascript
{
  title: String,
  description: String,
  skills: [String],
  experienceLevel: String,
  status: String,
  createdBy: ObjectId (ref: 'User')
}
```

### **5. AuditLog Model**
```javascript
{
  action: String,
  userId: ObjectId (ref: 'User'),
  userRole: String,
  details: Object,
  timestamp: Date
}
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### **Resumes**
- `POST /api/resumes/upload` - Upload resume (multipart/form-data)
- `GET /api/resumes/my-resumes` - Get user's resumes
- `GET /api/resumes/:id` - Get single resume
- `DELETE /api/resumes/:id` - Delete resume

### **Scoring**
- `POST /api/score/:resumeId` - Calculate ATS score
- `GET /api/score/:resumeId` - Get score for resume

### **Dashboard**
- `GET /api/dashboard/stats` - Get dashboard statistics

### **Authentication**
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🎨 Frontend Structure

### **Pages**
1. **Landing.jsx** - Homepage with hero section, features, CTA
2. **Login.jsx** - User login
3. **Register.jsx** - User registration
4. **Dashboard.jsx** - User dashboard with stats
5. **UploadResume.jsx** - Resume upload with drag-and-drop
6. **ResumeAnalyzer.jsx** - AI-powered resume analysis
7. **MyResumes.jsx** - List of user's resumes
8. **ATSScores.jsx** - Score history and distribution
9. **JobMatches.jsx** - Job recommendations
10. **ResumeTips.jsx** - Improvement tips
11. **Profile.jsx** - User profile
12. **Settings.jsx** - User settings

### **Components**
- **Layout**: DashboardLayout, Navbar, Sidebar
- **Dashboard**: DashboardCard, EmptyState, AnalyticsChart
- **Auth**: ProtectedRoute

### **Services**
- **api.js**: Centralized API service using Axios
  - Interceptors for token management
  - Automatic error handling
  - Base URL configuration

---

## ✨ Key Features

### **1. AI Resume Analysis**
- **Animated Analysis Screen**: Shows progress with 5 steps
  - Parsing resume
  - Detecting skills
  - Analyzing experience
  - Checking ATS compatibility
  - Generating insights

### **2. Deep Resume Feedback**
- **Strengths**: Highlights positive aspects
- **Issues**: Identifies problems to fix
- **ATS Optimization**: Keyword match, section completeness, formatting
- **Structure Analysis**: Table showing section status and feedback
- **AI Suggestions**: Categorized improvement tips

### **3. PDF Parsing**
- Extracts text from PDF files
- Handles text-based PDFs
- Error handling for image-based PDFs

### **4. Skill Detection**
- Pattern matching for common skills
- Synonym support (React = ReactJS)
- Case-insensitive matching
- Normalized skill names

### **5. User Management**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access (jobseeker, recruiter, admin)
- Protected routes

### **6. Dashboard Analytics**
- Latest ATS score display
- Resume count
- Average score
- Recent analysis history
- Score distribution charts

---

## 🔄 How It Works - Step by Step

### **1. User Registration/Login**
```
User → Register/Login → JWT Token Generated → Stored in localStorage
```

### **2. Resume Upload Flow**
```
User uploads PDF
  ↓
File saved to server/uploads/
  ↓
PDF parsed using pdf-parse
  ↓
Text extracted and normalized
  ↓
Skills, Education, Experience extracted
  ↓
Resume saved to database
  ↓
Score automatically calculated
  ↓
User redirected to Analyzer page
```

### **3. ATS Score Calculation Flow**
```
Resume uploaded
  ↓
If jobId provided:
  - Compare resume skills vs job requirements
  - Check experience level match
  - Calculate weighted score
Else (General scoring):
  - Count skills detected
  - Check if experience/education present
  - Calculate general quality score
  ↓
Score saved to database
  ↓
Resume status updated to 'scored'
```

### **4. Analysis Display Flow**
```
User opens Analyzer page
  ↓
Show animated analysis screen (4 seconds)
  - Progress bar animation
  - Step-by-step progress
  ↓
Fetch resume and score data
  ↓
Generate AI insights:
  - Strengths analysis
  - Issues detection
  - Structure analysis
  - Improvement suggestions
  ↓
Display comprehensive results
```

### **5. Skill Extraction Process**
```
PDF Text
  ↓
Normalize text (lowercase, remove special chars)
  ↓
Search for skill patterns using regex
  ↓
Check against skill synonyms dictionary
  ↓
Match found skills
  ↓
Return array of detected skills
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### **1. Clone and Install**
```bash
# Install root dependencies
npm install

# Install all dependencies (root + client + server)
npm run install-all
```

### **2. Environment Setup**

**Server (.env file in /server):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentscan
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Client (.env file in /client):**
```env
VITE_API_URL=http://localhost:5000/api
```

### **3. Start Development**
```bash
# Start both client and server
npm run dev

# Or start separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000/3001
```

### **4. Access Application**
- Frontend: http://localhost:3000 or http://localhost:3001
- Backend API: http://localhost:5000/api

---

## 📊 Scoring Algorithm Details

### **Skill Matching Algorithm**
```javascript
1. Normalize skill names (lowercase, remove special chars)
2. Check direct match
3. Check synonym match
4. Return true if any match found
```

### **Experience Extraction**
```javascript
Patterns searched:
- "(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)"
- "experience[:\s]+(\d+)"

If found: Extract number
If not found: Check for "experience" mentions
```

### **Education Detection**
```javascript
Keywords searched:
['bachelor', 'master', 'phd', 'doctorate', 'degree', 
 'diploma', 'university', 'college', 'education', 
 'bsc', 'msc', 'mba', 'ba', 'ma']

If found: Extract education line
Return: Array of education entries
```

---

## 🎨 Design System

### **Color Scheme**
- Primary: Purple (#6366f1) to Pink (#ec4899)
- Background: Dark gradient (purple-900 → blue-900 → pink-900)
- Cards: Glassmorphism (white/10 opacity with backdrop blur)
- Status Colors:
  - Success: Green
  - Warning: Yellow
  - Error: Red

### **UI Components**
- Glassmorphism cards with backdrop blur
- Gradient buttons and CTAs
- Animated progress bars
- Chart visualizations (Doughnut, Bar)
- Responsive grid layouts

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Token-based auth
3. **Protected Routes**: Middleware checks authentication
4. **File Upload Validation**: PDF only, size limits
5. **Input Sanitization**: Text normalization
6. **CORS**: Configured for allowed origins

---

## 📈 Future Enhancements

- Real job matching with external APIs
- Resume templates
- PDF export with improvements
- Email notifications
- Resume versioning
- Advanced AI suggestions
- Integration with job boards

---

## 🐛 Error Handling

- **PDF Parsing Errors**: Catches and returns user-friendly messages
- **Score Calculation Errors**: Logs errors, returns fallback scores
- **API Errors**: Centralized error handling in Axios interceptors
- **Authentication Errors**: Redirects to login on 401

---

## 📝 Notes

- The system supports both **job-specific scoring** (with jobId) and **general scoring** (without jobId)
- Skills are detected using pattern matching, not NLP/AI (for simplicity)
- The scoring algorithm is rule-based, not machine learning-based
- All file uploads are stored locally in `server/uploads/`
- MongoDB indexes are set up for faster queries

---

**Built with ❤️ using React, Node.js, and MongoDB**


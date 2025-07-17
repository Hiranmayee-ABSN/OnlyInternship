# OnlyInternship Backend

A simple Node.js/Express backend for the OnlyInternship frontend application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## API Endpoints

### GET /api/internships
Returns a list of available internships from `internships.json`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Frontend Developer Intern",
    "company": "TechCorp Solutions",
    "location": "Remote",
    "duration": "3 months",
    "stipend": "$2000/month",
    "description": "...",
    "requirements": ["HTML/CSS", "JavaScript", "React basics", "Git"],
    "postedDate": "2024-01-15"
  }
]
```

### POST /api/apply
Submits an internship application and stores it in `applications.txt`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "internshipId": 1,
  "coverLetter": "I am interested in...",
  "resume": "resume.pdf",
  "skills": "JavaScript, React, Node.js",
  "experience": "2 years of web development"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully!",
  "applicationId": 1703123456789
}
```

### POST /api/post-internship
Posts a new internship and adds it to `internships.json`

**Request Body:**
```json
{
  "title": "Frontend Developer Intern",
  "company": "TechCorp Solutions",
  "location": "Remote",
  "duration": "3 months",
  "stipend": "$2000/month",
  "description": "Join our frontend team to build responsive web applications...",
  "requirements": ["HTML/CSS", "JavaScript", "React basics", "Git"],
  "postedDate": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Internship posted successfully!",
  "internshipId": 6
}
```

## File Structure

- `server.js` - Main Express server file
- `package.json` - Node.js dependencies and scripts
- `internships.json` - Mock internship data
- `applications.txt` - Stored applications (created when first application is submitted)
- HTML files - Frontend pages served as static files

## Features

- Serves all HTML, CSS, and JavaScript files from the current directory
- Provides RESTful API endpoints for internships and applications
- Stores applications in a simple text file format
- Handles routing for single-page application behavior

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the application**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `onlyinternship` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Your app will be deployed** to a URL like: `https://onlyinternship-xxxxx.vercel.app`

### Manual Deployment Steps

1. **Push to GitHub** (if using Git):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/onlyinternship.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy automatically

### Environment Variables

No environment variables are required for this application. All data is stored in local JSON and text files. 
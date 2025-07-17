const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for recruiters (in production, use a database)
let recruiters = [];
let recruiterSessions = {};

// Load existing recruiters from file if it exists
try {
  if (fs.existsSync('recruiters.json')) {
    const recruitersData = fs.readFileSync('recruiters.json', 'utf8');
    recruiters = JSON.parse(recruitersData);
  }
} catch (error) {
  console.error('Error loading recruiters data:', error);
}

// Helper function to save recruiters to file
function saveRecruiters() {
  try {
    fs.writeFileSync('recruiters.json', JSON.stringify(recruiters, null, 2));
  } catch (error) {
    console.error('Error saving recruiters data:', error);
  }
}

// Helper function to generate session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// API Routes

// POST /api/recruiter/signup - Register new recruiter
app.post('/api/recruiter/signup', (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !company) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    // Check if email already exists
    if (recruiters.find(recruiter => recruiter.email === email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }
    
    // Create new recruiter
    const newRecruiter = {
      id: recruiters.length + 1,
      name,
      email,
      password, // In production, hash the password
      company,
      createdAt: new Date().toISOString()
    };
    
    recruiters.push(newRecruiter);
    saveRecruiters();
    
    res.json({ 
      success: true, 
      message: 'Recruiter registered successfully!',
      recruiterId: newRecruiter.id
    });
  } catch (error) {
    console.error('Error registering recruiter:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register recruiter' 
    });
  }
});

// POST /api/recruiter/login - Authenticate recruiter
app.post('/api/recruiter/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    // Find recruiter by email
    const recruiter = recruiters.find(r => r.email === email);
    
    if (!recruiter || recruiter.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Generate session token
    const sessionToken = generateSessionToken();
    recruiterSessions[sessionToken] = {
      recruiterId: recruiter.id,
      email: recruiter.email,
      name: recruiter.name,
      company: recruiter.company,
      createdAt: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      message: 'Login successful!',
      sessionToken,
      recruiter: {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to authenticate' 
    });
  }
});

// GET /api/recruiter/profile - Get recruiter profile (requires authentication)
app.get('/api/recruiter/profile', (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken || !recruiterSessions[sessionToken]) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    const session = recruiterSessions[sessionToken];
    const recruiter = recruiters.find(r => r.id === session.recruiterId);
    
    if (!recruiter) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recruiter not found' 
      });
    }
    
    res.json({ 
      success: true, 
      recruiter: {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company,
        createdAt: recruiter.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting recruiter profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile' 
    });
  }
});

// POST /api/recruiter/logout - Logout recruiter
app.post('/api/recruiter/logout', (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionToken && recruiterSessions[sessionToken]) {
      delete recruiterSessions[sessionToken];
    }
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to logout' 
    });
  }
});

// GET /api/internships - Return mock internship data
app.get('/api/internships', (req, res) => {
  try {
    const internshipsData = fs.readFileSync('internships.json', 'utf8');
    const internships = JSON.parse(internshipsData);
    res.json(internships);
  } catch (error) {
    console.error('Error reading internships data:', error);
    res.status(500).json({ error: 'Failed to load internships data' });
  }
});

// POST /api/apply - Store submitted applications
app.post('/api/apply', (req, res) => {
  try {
    const application = req.body;
    
    // Add timestamp to application
    application.timestamp = new Date().toISOString();
    
    // Format application data for storage
    const applicationText = `
=== NEW APPLICATION ===
Timestamp: ${application.timestamp}
Name: ${application.name || 'N/A'}
Email: ${application.email || 'N/A'}
Phone: ${application.phone || 'N/A'}
College: ${application.college || 'N/A'}
Internship ID: ${application.internshipId || 'N/A'}
Internship Title: ${application.internshipTitle || 'N/A'}
Cover Letter: ${application.coverLetter || 'N/A'}
Resume: ${application.resume || 'N/A'}
Skills: ${application.skills || 'N/A'}
Experience: ${application.experience || 'N/A'}
=====================================
`;

    // Append to applications.txt file
    fs.appendFileSync('applications.txt', applicationText);
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      applicationId: Date.now()
    });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application' 
    });
  }
});

// GET /api/applications - Return all applications
app.get('/api/applications', (req, res) => {
  try {
    // Check if applications.txt exists
    if (!fs.existsSync('applications.txt')) {
      return res.json([]);
    }

    const applicationsData = fs.readFileSync('applications.txt', 'utf8');
    const applications = [];
    
    // Parse the applications.txt file
    const applicationBlocks = applicationsData.split('=== NEW APPLICATION ===').filter(block => block.trim());
    
    applicationBlocks.forEach(block => {
      const lines = block.split('\n').filter(line => line.trim() && !line.startsWith('==='));
      const application = {};
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(': ');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(': ').trim();
          application[key.toLowerCase().replace(/\s+/g, '')] = value;
        }
      });
      
      if (Object.keys(application).length > 0) {
        applications.push(application);
      }
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error reading applications data:', error);
    res.status(500).json({ error: 'Failed to load applications data' });
  }
});

// POST /api/post-internship - Add new internship
app.post('/api/post-internship', (req, res) => {
  try {
    const newInternship = req.body;
    
    // Read existing internships
    const internshipsData = fs.readFileSync('internships.json', 'utf8');
    const internships = JSON.parse(internshipsData);
    
    // Generate new ID (max existing ID + 1)
    const maxId = Math.max(...internships.map(internship => internship.id), 0);
    newInternship.id = maxId + 1;
    
    // Add to internships array
    internships.push(newInternship);
    
    // Write back to file
    fs.writeFileSync('internships.json', JSON.stringify(internships, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Internship posted successfully!',
      internshipId: newInternship.id
    });
  } catch (error) {
    console.error('Error posting internship:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to post internship' 
    });
  }
});

// Serve HTML files for all routes (SPA-like behavior)
app.get('*', (req, res) => {
  const requestedPath = req.path;
  const htmlFile = requestedPath === '/' ? 'index.html' : requestedPath.substring(1);
  const filePath = path.join(__dirname, 'public', htmlFile);

  // Check if the requested file exists in public
  if (fs.existsSync(filePath) && htmlFile.endsWith('.html')) {
    res.sendFile(filePath);
  } else {
    // Fallback to public/index.html for any non-existent routes
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// WARNING: File writes (applications.txt, recruiters.json, internships.json) will NOT persist on Vercel. Use a database or remote storage for production.

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/internships - Get all internships`);
  console.log(`  GET  /api/applications - Get all applications`);
  console.log(`  POST /api/apply - Submit application`);
  console.log(`  POST /api/post-internship - Post new internship`);
  console.log(`  POST /api/recruiter/signup - Register new recruiter`);
  console.log(`  POST /api/recruiter/login - Authenticate recruiter`);
  console.log(`  GET  /api/recruiter/profile - Get recruiter profile`);
  console.log(`  POST /api/recruiter/logout - Logout recruiter`);
  console.log(`Static files are being served from the public directory`);
}); 
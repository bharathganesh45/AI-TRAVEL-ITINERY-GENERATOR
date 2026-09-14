# AI Travel Itinerary Generator

A modern, AI-powered travel planning application that creates personalized itineraries using Google Gemini AI. Upload your booking documents, and let AI generate detailed day-by-day travel plans tailored to your trip.

## Overview

Planning a trip can be overwhelming. With dozens of attractions, countless restaurants, and complex logistics to organize, travelers often feel lost. That's where our AI Travel Itinerary Generator comes in. 

This platform combines the power of artificial intelligence with practical travel planning tools. Upload your flight tickets, hotel bookings, or any travel documents, and our system automatically extracts booking information and generates comprehensive itineraries. Need to adjust your plans? Regenerate with custom notes and preferences.

## Features

### 🤖 AI-Powered Planning
- **Intelligent Itinerary Generation**: Google Gemini AI creates detailed, location-accurate day-by-day plans
- **Smart Regeneration**: Refine itineraries with custom preferences and notes
- **Real Place Integration**: AI uses actual hotels, restaurants, and attractions from your destination
- **Booking Awareness**: Incorporates your flight times, hotel check-ins, and transport details

### 📄 Document Processing
- **PDF Parsing**: Automatically extract text from PDF documents
- **Booking Extraction**: OCR-powered extraction of flight numbers, hotel names, dates, and references
- **Multi-format Support**: Handle various booking formats from different providers
- **Confidence Scoring**: Track extraction accuracy for each booking detail

### 🗺️ Smart Trip Management
- **Trip Organization**: Create and manage multiple trips
- **Flexible Duration**: Support trips from 1 to 30+ days
- **Group Planning**: Accommodate different group sizes (solo to large groups)
- **Status Tracking**: Monitor trip planning progress (Draft → Itinerary Ready)

### 👥 Collaboration Features
- **Share Itineraries**: Generate unique links to share your plans
- **Public Access**: Share read-only itineraries with family and friends
- **Link Expiration**: Set expiration dates for shared links
- **View Tracking**: Monitor how many times your itinerary was viewed

### 🔐 Security & Auth
- **User Authentication**: Secure JWT-based authentication
- **Password Hashing**: Industry-standard bcrypt password hashing
- **Session Management**: Persistent login with automatic token refresh
- **Data Privacy**: User data is isolated and protected

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM/Query**: Custom SQL with pg library
- **AI**: Google Gemini API (2.0 Flash)
- **Auth**: JWT + bcryptjs
- **File Processing**: Multer, pdf-parse, Tesseract.js
- **QR Codes**: qrcode library

### Frontend
- **Framework**: React
- **Build Tool**: Webpack/Create React App
- **UI Components**: Custom React components
- **State Management**: React hooks
- **HTTP Client**: Fetch API

###  Database

- **Database**: PostgreSQL 15
- **Admin Panel**: pgAdmin 4


## Project Structure

```
Travel Itinerary Generator/
├── Backend/                          # Express.js API Server
│   ├── config/                       # Configuration modules
│   │   ├── ai.js                    # Google Gemini AI client setup
│   │   ├── db.js                    # PostgreSQL connection & schema
│   │   ├── jwt.js                   # JWT token generation
│   │   └── multer.js                # File upload middleware
│   ├── controllers/                  # Request handlers (Business Logic)
│   │   ├── aiController.js          # Itinerary generation endpoints
│   │   ├── authController.js        # User authentication
│   │   ├── tripController.js        # Trip management
│   │   ├── uploadController.js      # Document upload handling
│   │   └── shareController.js       # Sharing functionality
│   ├── models/                       # Database models & queries
│   │   ├── userModel.js             # User CRUD operations
│   │   ├── tripModel.js             # Trip management queries
│   │   ├── documentModel.js         # Document storage queries
│   │   ├── itineraryModel.js        # Itinerary queries
│   │   └── bookingModel.js          # Booking info queries
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── errorHandler.js          # Centralized error handling
│   │   └── uploadMiddleware.js      # File upload validation
│   ├── routes/                       # API route definitions
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── aiRoutes.js              # /api/ai endpoints
│   │   ├── tripRoutes.js            # /api/trips endpoints
│   │   ├── uploadRoutes.js          # /api/upload endpoints
│   │   └── shareRoutes.js           # /api/share endpoints
│   ├── services/                     # Business logic layer
│   │   └── aiService.js             # AI generation logic
│   ├── utils/                        # Utility functions
│   │   ├── prompts.js               # AI prompt templates
│   │   ├── formatter.js             # Response formatting
│   │   ├── parser.js                # Data parsing utilities
│   │   └── attractions.js           # Fallback attraction data
│   ├── uploads/                      # User-uploaded files
│   ├── app.js                        # Express app setup
│   ├── server.js                     # Server entry point
│   ├── package.json                  # Dependencies
│   └── .env.example                  # Environment template
├── Frontend/app/                     # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── styles/                  # CSS stylesheets
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # React entry point
│   ├── public/                       # Static assets
│   └── package.json                 # Frontend dependencies
├── docker-compose.yml                # PostgreSQL + pgAdmin setup
├── DATABASE_SETUP.md                 # Database documentation
├── PGADMIN_SETUP.md                  # pgAdmin guide
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

## Core Workflows

### 1. User Authentication Flow

```
User Registration
    ↓
Validate Email & Password
    ↓
Hash Password (bcrypt)
    ↓
Store in Database
    ↓
Return Success Message

User Login
    ↓
Verify Credentials
    ↓
Generate JWT Token
    ↓
Return Token to Client
    ↓
Client Stores Token (localStorage)
```

### 2. Trip Creation & Management

```
Create New Trip
    ↓
User Provides: Title, Destination, Duration, Travelers
    ↓
Store in Database (Draft Status)
    ↓
User Can Upload Documents
    ↓
User Can Generate Itinerary
    ↓
Status Changes to "Itinerary Ready"
```

### 3. AI Itinerary Generation

```
User Uploads Booking Documents (PDF)
    ↓
Backend Processes Files
    ├─ Extract Text (pdf-parse)
    ├─ Run OCR (Tesseract.js)
    └─ Parse Booking Info
    ↓
Collect Trip Information
    ├─ Destination
    ├─ Duration
    ├─ Number of Travelers
    └─ Any Custom Notes
    ↓
Build AI Prompt with All Context
    ↓
Send to Google Gemini API
    ├─ Model: gemini-2.0-flash
    ├─ Timeout: 60 seconds
    └─ Response Format: Structured JSON
    ↓
Parse & Validate AI Response
    ├─ Verify All Required Fields
    ├─ Format Dates & Times
    └─ Clean Up Text
    ↓
Store in Database
    ├─ Save Full Response
    ├─ Create Itinerary Record
    └─ Update Trip Status
    ↓
Return to User
    ├─ Display Day-by-Day Plan
    ├─ Show Hotels & Restaurants
    ├─ List Activities & Timings
    └─ Display Budget & Packing List
```

### 4. Document Processing Pipeline

```
User Uploads PDF
    ↓
Validate File
    ├─ Check File Type
    ├─ Verify File Size
    └─ Scan for Issues
    ↓
Extract Text from PDF
    ├─ Parse PDF Structure
    ├─ Extract Text Content
    └─ Preserve Formatting
    ↓
Run OCR (if needed)
    └─ Process Scanned Images
    ↓
Extract Booking Information
    ├─ Flight Details (Airline, Number, Times)
    ├─ Hotel Info (Name, Address, Dates)
    ├─ Passenger Details
    └─ Booking References
    ↓
Calculate Confidence Score
    └─ Higher = More Reliable
    ↓
Store Extracted Data
    ├─ Save to Documents Table
    ├─ Link to Trip
    └─ Save Confidence Score
    ↓
Return to User
    └─ Display Extracted Information
```

### 5. Share & Collaborate

```
User Generates Share Link
    ↓
Create Unique Share Token
    ↓
Store in Database
    ├─ Link Token to Trip
    ├─ Set Expiration (Optional)
    └─ Initialize View Count
    ↓
Generate Public URL
    └─ Format: /share/{token}
    ↓
User Shares URL
    ↓
Someone Accesses Shared Link
    ↓
Verify Token Exists & Valid
    ├─ Check Not Expired
    ├─ Check Still Active
    └─ Verify Trip Exists
    ↓
Display Itinerary (Read-Only)
    ↓
Increment View Counter
    ↓
User Can See View Stats
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Docker & Docker Compose
- PostgreSQL (via Docker, or local installation)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bharathganesh45/AI-TRAVEL-ITINERY-GENERATOR.git
   cd "Travel itinery generator"
   ```

2. **Start the database services**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL on port 5433 and pgAdmin on port 5050

3. **Set up the backend**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   ```

4. **Update environment variables**
   Edit `Backend/.env` and add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - Database credentials (should be pre-filled)

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:8000

6. **Set up the frontend** (in another terminal)
   ```bash
   cd Frontend/app
   npm install
   npm start
   ```
   App runs on http://localhost:3000

### Verify Installation

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/health
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5433

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Clear session

### Trips
- `POST /api/trips` - Create new trip
- `GET /api/trips` - List all trips
- `GET /api/trips/:tripId` - Get trip details
- `PUT /api/trips/:tripId` - Update trip
- `DELETE /api/trips/:tripId` - Delete trip

### AI & Itineraries
- `POST /api/ai/generate` - Generate itinerary from documents
- `GET /api/ai/:tripId` - Fetch saved itinerary
- `PUT /api/ai/:tripId` - Regenerate with custom notes

### Documents & Upload
- `POST /api/upload` - Upload booking documents
- `GET /api/documents/:tripId` - Get trip documents
- `DELETE /api/documents/:docId` - Delete document

### Sharing
- `POST /api/share` - Create share link
- `GET /api/share/:token` - Access shared itinerary
- `DELETE /api/share/:linkId` - Revoke share link

## Database Schema

### Users Table
Stores user account information with encrypted passwords.

### Trips Table
Contains trip metadata and planning status. Users can have multiple trips.

### Documents Table
Tracks uploaded booking documents associated with trips.

### Booking Information Table
Stores extracted booking data with confidence scores.

### Itineraries Table
Saves AI-generated itineraries and raw AI responses.

### Share Links Table
Manages public sharing URLs with expiration support.

## Configuration

### Environment Variables

```env
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=AI TRAVEL ITINERY
DB_USER=postgres
DB_PASSWORD=1008

# AI
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_TIMEOUT_MS=60000

# Auth
JWT_SECRET=your-secret-key-here
```

## Development

### Running Tests
```bash
# Backend tests (when available)
npm test
```

### Database Management
```bash
# Access pgAdmin
# Navigate to http://localhost:5050
# Email: admin@tripai.local
# Password: admin123

# Direct PostgreSQL access
docker-compose exec postgres psql -U postgres -d "AI TRAVEL ITINERY"
```

### Debugging
Enable detailed logging by setting `NODE_ENV=development` in `.env`

## Deployment

### Production Checklist
- [ ] Update JWT_SECRET with strong random value
- [ ] Change pgAdmin default credentials
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints
- [ ] Verify file upload security

### Building for Production
```bash
# Backend
npm install
npm start

# Frontend
npm run build
```

## Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: Failed to initialize database
```
Solution: Verify PostgreSQL is running (`docker-compose ps`) and credentials are correct in `.env`

**AI Generation Timeout**
```
Error: Gemini timed out after 60000ms
```
Solution: Increase `GEMINI_TIMEOUT_MS` in `.env` or try again later

**Document Upload Fails**
```
Error: File size too large
```
Solution: Check `Backend/config/multer.js` for file size limits

**pgAdmin Can't Connect to Database**
```
Error: Unable to connect to server
```
Solution: In pgAdmin, verify hostname is `postgres` (not localhost) when using Docker

## Performance Optimization

- **Caching**: Implement Redis for session/data caching
- **Database Indexing**: Indexes are auto-created on foreign keys and unique fields
- **File Compression**: PDFs are processed efficiently with streaming
- **AI Model Selection**: Using gemini-2.0-flash for optimal speed/quality balance

## Security Considerations

- Passwords are hashed with bcrypt (10 rounds)
- JWTs expire after 24 hours
- File uploads are validated and scanned
- SQL injection is prevented with parameterized queries
- CORS is configured for allowed origins
- User data is isolated per account

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Roadmap

- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced trip analytics
- [ ] Integration with booking platforms
- [ ] Real-time collaboration
- [ ] Voice-based itinerary generation
- [ ] Alternative AI providers

## Support

For issues, questions, or suggestions:
1. Check existing issues on GitHub
2. Open a new issue with detailed description
3. Contact: bharathganesh45@github.com

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Google Gemini API** for AI-powered itinerary generation
- **PostgreSQL** for reliable data storage
- **React** for the frontend framework
- **Express.js** for the backend framework
- **Docker** for containerization and easy deployment

---

**Made with ❤️ for travelers everywhere**

*Last Updated: September 2026*

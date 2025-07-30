# LeadRules Admin Console

A comprehensive admin console built with Next.js, Chakra UI, and NextAuth.js for managing questionnaires across multiple websites.

## Features

- ✅ **NextAuth.js v4** - Secure authentication
- ✅ **PostgreSQL Database** - User and session storage
- ✅ **Admin Console** - Protected admin dashboard with statistics
- ✅ **Website Management** - Create and manage multiple websites
- ✅ **Questionnaire System** - Build and deploy questionnaires
- ✅ **Response Collection** - Collect user responses from frontend websites
- ✅ **Chakra UI v3** - Modern UI components
- ✅ **Email/Password Login** - Credentials authentication
- ✅ **Role-based Access** - Admin and user roles
- ✅ **Multi-tenant Architecture** - Each website has unique identifier

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up PostgreSQL Database

You need a PostgreSQL database running. You can use:
- Local PostgreSQL installation
- Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
- Cloud service (Supabase, Railway, etc.)

### 3. Configure Environment Variables

Create `.env.local` with:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadsrules"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed admin user
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

## Admin Access

**Default Admin Credentials:**
- **Email:** `admin@leadsrules.com`
- **Password:** `admin123`

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin console (protected)
│   ├── auth/signin/     # Login page
│   ├── api/auth/        # NextAuth.js API routes
│   └── page.js          # Home page
├── components/          # Reusable components
└── lib/
    └── db.js           # Database utilities
```

## Database Schema

The application uses Prisma with the following models:
- **User** - User accounts with roles
- **Account** - OAuth accounts (for future use)
- **Session** - User sessions
- **VerificationToken** - Email verification tokens
- **Website** - Frontend websites with unique identifiers
- **Questionnaire** - Questionnaires associated with websites
- **Question** - Individual questions within questionnaires
- **Response** - User responses to questionnaires

## API Endpoints

### Admin API (Protected)
- `GET /api/websites` - List all websites
- `POST /api/websites` - Create new website
- `GET /api/websites/[id]` - Get website details
- `PUT /api/websites/[id]` - Update website
- `DELETE /api/websites/[id]` - Delete website

### Public API (For Frontend Websites)
- `GET /api/public/websites/[identifier]/questionnaires` - Get questionnaires for a website
- `POST /api/public/websites/[identifier]/questionnaires/[id]/responses` - Submit questionnaire response

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:turbo` - Start with Turbopack
- `npm run build` - Build for production
- `npm run seed` - Seed database with admin user

## Authentication Flow

1. **Login Page** (`/auth/signin`) - Email/password authentication
2. **Admin Console** (`/admin`) - Protected admin dashboard
3. **Home Page** (`/`) - Shows login status and admin link

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT session strategy
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Secure environment variables

## Admin Console Features

### Dashboard
- Real-time statistics (websites, questionnaires, responses)
- Quick action buttons for common tasks
- System status overview

### Website Management
- View all websites with questionnaire counts
- Add new websites with unique identifiers
- Edit website details (name, identifier, active status)
- Delete websites (only if no questionnaires exist)

### Security
- Admin-only access to all management features
- Protected API endpoints
- Session-based authentication

## Frontend Integration

Frontend websites can connect to the system using their unique identifier:

```javascript
// Example: Fetch questionnaires for a website
const response = await fetch('/api/public/websites/my-website/questionnaires');
const data = await response.json();

// Example: Submit a questionnaire response
const response = await fetch('/api/public/websites/my-website/questionnaires/123/responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { question1: 'answer1', question2: 'answer2' }
  })
});
```

## Next Steps

1. **Questionnaire Builder** - Create the questionnaire creation interface
2. **Response Analytics** - Build analytics dashboard for responses
3. **API Documentation** - Create comprehensive API documentation
4. **Frontend SDK** - Provide SDK for frontend websites
5. **Advanced Features** - Export functionality, advanced analytics

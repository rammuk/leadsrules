# LeadsRules - Next.js with Authentication

A Next.js application with NextAuth.js v4 authentication, PostgreSQL database, and admin console.

## Features

- ✅ **NextAuth.js v4** - Secure authentication
- ✅ **PostgreSQL Database** - User and session storage
- ✅ **Admin Console** - Protected admin dashboard
- ✅ **Chakra UI v3** - Modern UI components
- ✅ **Email/Password Login** - Credentials authentication
- ✅ **Role-based Access** - Admin and user roles

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

## Next Steps

- Add user registration
- Implement email verification
- Add OAuth providers (Google, GitHub)
- Create user management in admin console
- Add audit logs
- Implement password reset functionality

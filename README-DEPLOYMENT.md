# Deployment Guide for LeadsRules

This guide will help you deploy the LeadsRules application to Vercel with a database.

## Prerequisites

- Vercel account
- Database service (Vercel Postgres, PlanetScale, or Supabase)
- Git repository

## Option 1: Vercel Postgres (Recommended)

### 1. Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database
3. Choose "Postgres" and follow the setup wizard
4. Note down the connection string

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:

```bash
DATABASE_URL=your-vercel-postgres-connection-string
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 3. Run Database Migrations

After deployment, run the database migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Run migrations
npx prisma db push --preview-feature
```

## Option 2: PlanetScale

### 1. Create PlanetScale Database

1. Go to [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get the connection string

### 2. Deploy to Vercel

Same as above, but use PlanetScale connection string.

## Option 3: Supabase

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings → Database

### 2. Deploy to Vercel

Same as above, but use Supabase connection string.

## Local Development with Docker

### 1. Build and Run

```bash
# Build the application
docker-compose build

# Start the services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push

# Seed the database
docker-compose exec app node scripts/seed.js
```

### 2. Access the Application

- Application: http://localhost:3000
- Admin: http://localhost:3000/admin
- Public: http://localhost:3000/public

## Environment Variables

Create a `.env` file for local development:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadsrules"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Public Config
PUBLIC_WEBSITE_ID="your-website-id"
PUBLIC_WEBSITE_NAME="Your Website Name"
PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

## Production Environment Variables

Set these in your Vercel dashboard:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
PUBLIC_WEBSITE_ID="your-website-id"
PUBLIC_WEBSITE_NAME="Your Website Name"
PUBLIC_API_BASE_URL="https://your-domain.vercel.app/api"
```

## Database Schema

The application uses Prisma with the following models:

- `Website` - Website configurations
- `QuestionBank` - Question templates
- `Questionnaire` - Questionnaire definitions
- `QuestionnaireStep` - Steps within questionnaires
- `StepQuestion` - Questions within steps
- `StepQuestionOption` - Options for questions
- `AdminUser` - Admin authentication
- `QuestionnaireResponse` - User responses

## GeoIP Database

The application includes a MaxMind GeoIP database file (`GeoIP2-City.mmdb`). This file is:

- Included in the Docker build
- Mounted as a volume in docker-compose
- Should be included in your Git repository for Vercel deployment

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your DATABASE_URL is correct
   - Ensure the database is accessible from Vercel
   - Check if migrations have been run

2. **NextAuth Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

3. **GeoIP Errors**
   - Ensure the GeoIP2-City.mmdb file is present
   - Check file permissions

### Vercel-Specific Notes

- Vercel has a 50MB file size limit for serverless functions
- The GeoIP database file is ~116MB, so it's mounted as a volume
- Consider using a CDN for the GeoIP database in production

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to Git
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling in production
   - Enable SSL for database connections
   - Restrict database access to your Vercel deployment

3. **Authentication**
   - Use strong NEXTAUTH_SECRET values
   - Consider using OAuth providers in production
   - Implement rate limiting for auth endpoints 
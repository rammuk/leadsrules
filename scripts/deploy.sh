#!/bin/bash

# Deployment script for LeadsRules
# This script helps prepare and deploy the application to Vercel

set -e

echo "🚀 Starting LeadsRules deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadsrules"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Public Config
PUBLIC_WEBSITE_ID="your-website-id"
PUBLIC_WEBSITE_NAME="Your Website Name"
PUBLIC_API_BASE_URL="http://localhost:3000/api"
EOF
    echo "✅ Created .env template. Please update with your values."
fi

# Check if GeoIP database exists
if [ ! -f "src/lib/GeoIP2-City.mmdb" ]; then
    echo "⚠️  GeoIP database not found. Please add GeoIP2-City.mmdb to src/lib/"
    echo "   You can download it from MaxMind (requires account)"
fi

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up your database (Vercel Postgres, PlanetScale, or Supabase)"
echo "2. Add environment variables in Vercel dashboard"
echo "3. Run database migrations: npx prisma db push"
echo "4. Seed the database: node scripts/seed.js"
echo ""
echo "For detailed instructions, see README-DEPLOYMENT.md" 
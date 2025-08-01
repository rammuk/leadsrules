# GeoIP Setup Guide

## Overview
This project supports two GeoIP methods:
1. **Local MaxMind Database** (`.mmdb` file) - for local development
2. **MaxMind Cloud API** - for production deployment

**Note**: The `.mmdb` file is now stored using Git LFS for easy team collaboration.

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/rammuk/leadsrules.git
cd leadsrules
```

### 2. Install Git LFS (if not already installed)
```bash
git lfs install
```

### 3. Pull Large Files
```bash
git lfs pull
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Development
```bash
npm run dev
```

### 6. Test GeoIP
```bash
# Test local database
curl http://localhost:3000/api/geoip/lookup

# Test MaxMind API (if credentials set)
curl http://localhost:3000/api/geoip/api-lookup
```

## Local Development Setup

### Git LFS Configuration
The `.mmdb` file is automatically managed by Git LFS:
- **File tracking**: `*.mmdb` files are tracked by LFS
- **Automatic download**: `git lfs pull` downloads large files
- **Version control**: Database updates are tracked in Git

### Manual Database Update (if needed)
```bash
# Download new database from MaxMind
# https://dev.maxmind.com/geoip/geoip2/geolite2/

# Replace the existing file
cp new-database.mmdb src/lib/GeoIP2-City.mmdb

# Commit the update
git add src/lib/GeoIP2-City.mmdb
git commit -m "Update GeoIP database"
git push origin main
```

## Production Setup (Vercel)

### 1. MaxMind API (Recommended)
```bash
# Sign up for free account
# https://www.maxmind.com/en/geolite2/signup

# Add environment variables to Vercel
vercel env add MAXMIND_ACCOUNT_ID
vercel env add MAXMIND_LICENSE_KEY
```

### 2. Test Production API
```bash
# Test MaxMind API lookup
curl https://your-app.vercel.app/api/geoip/api-lookup

# Compare both methods
curl https://your-app.vercel.app/api/geoip/compare-methods
```

## API Endpoints

### Local Database
- `GET /api/geoip/lookup` - Get location from local .mmdb file
- `POST /api/geoip/lookup` - Test specific IP with local database

### MaxMind API
- `GET /api/geoip/api-lookup` - Get location from MaxMind Cloud API
- `POST /api/geoip/api-lookup` - Test specific IP with MaxMind API

### Comparison
- `GET /api/geoip/compare-methods` - Compare performance of both methods
- `POST /api/geoip/compare-methods` - Test specific IP with both methods

## Environment Variables

### Local Development (.env)
```bash
# Optional: MaxMind API credentials
MAXMIND_ACCOUNT_ID="your_account_id"
MAXMIND_LICENSE_KEY="your_license_key"
```

### Production (Vercel)
```bash
# Required for MaxMind API
MAXMIND_ACCOUNT_ID="your_account_id"
MAXMIND_LICENSE_KEY="your_license_key"
```

## File Structure
```
src/
├── lib/
│   ├── geoip.js          # Local .mmdb file handler
│   ├── geoip-api.js      # MaxMind API handler
│   └── GeoIP2-City.mmdb  # MaxMind database (Git LFS)
├── app/api/geoip/
│   ├── lookup/           # Local database endpoint
│   ├── api-lookup/       # MaxMind API endpoint
│   └── compare-methods/  # Comparison endpoint
└── components/ui/
    └── GeoIPComparison.jsx  # UI component for testing
```

## Git LFS Commands

### Check LFS Status
```bash
git lfs status
git lfs ls-files
```

### Pull LFS Files
```bash
git lfs pull
```

### Track New Large Files
```bash
git lfs track "*.extension"
git add .gitattributes
```

## Troubleshooting

### Git LFS Issues
- **Missing files**: Run `git lfs pull`
- **Installation**: Run `git lfs install`
- **Tracking**: Check `.gitattributes` file

### Local Database Issues
- Ensure `.mmdb` file exists in `src/lib/`
- Check file permissions
- Verify file is not corrupted

### API Issues
- Verify MaxMind credentials
- Check network connectivity
- Review API rate limits

### Vercel Deployment
- Local `.mmdb` file won't work on Vercel
- Use MaxMind API for production
- Add environment variables to Vercel

## Performance Comparison

### Local Database (.mmdb)
- ✅ Fast lookup (< 10ms)
- ✅ No network dependency
- ✅ Free to use
- ✅ Git LFS managed
- ❌ Manual updates required
- ❌ Won't work on Vercel

### MaxMind API
- ✅ Always up-to-date data
- ✅ Works on Vercel
- ✅ No file storage needed
- ❌ Network dependency (50-200ms)
- ❌ API rate limits
- ❌ Requires account/credentials

## Recommendations

1. **Development**: Use local `.mmdb` file for speed
2. **Production**: Use MaxMind API for reliability
3. **Team Setup**: Git LFS handles database sharing
4. **Testing**: Use comparison endpoint to evaluate performance
5. **Updates**: Commit new database files to Git LFS 
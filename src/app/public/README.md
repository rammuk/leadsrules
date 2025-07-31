# Public Frontend

This directory contains the public-facing questionnaire system that users can access to complete questionnaires.

## Pages

### `/public` - Welcome Page
- Shows website information and system status
- Displays database connection status
- Links to start the questionnaire
- Shows questionnaire availability

### `/public/questionnaire` - Questionnaire Interface
- Step-by-step questionnaire completion
- Progress tracking
- Support for multiple question types:
  - Text input
  - Text area
  - Date picker
  - Multiple choice options
- Navigation between steps
- Form validation and submission

### `/public/thank-you` - Confirmation Page
- Shows after successful questionnaire submission
- Displays response ID and timestamp
- Link back to home page

## API Routes

### `GET /api/public/websites/[identifier]/questionnaires`
Fetches questionnaire data for a specific website identifier.

### `POST /api/public/websites/[identifier]/questionnaires/[id]/responses`
Handles questionnaire response submissions.

## Configuration

The public frontend uses configuration from `src/config/public.js`:

```javascript
export const publicConfig = {
  websiteId: process.env.PUBLIC_WEBSITE_ID || 'cmdqjotiw0001m5541me4i25n',
  websiteName: process.env.PUBLIC_WEBSITE_NAME || 'Sample Website',
  apiBaseUrl: process.env.PUBLIC_API_BASE_URL || 'http://localhost:3003/api',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/leadsrules'
}
```

## Environment Variables

Set these environment variables for the public frontend:

```bash
PUBLIC_WEBSITE_ID="your-website-id"
PUBLIC_WEBSITE_NAME="Your Website Name"
PUBLIC_API_BASE_URL="http://localhost:3003/api"
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadsrules"
```

## Features

- **Database Connectivity**: Direct connection to PostgreSQL using Prisma
- **Real-time Status**: Shows database connection and questionnaire availability
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Smooth loading experiences with spinners
- **Error Handling**: Graceful error handling and user feedback
- **Navigation**: Clean navigation between pages
- **Form Validation**: Client-side validation for required fields

## Usage

1. Access the public frontend at `http://localhost:3003/public`
2. View system status and questionnaire availability
3. Click "Start Questionnaire" to begin
4. Complete questions step by step
5. Submit responses to save to database
6. View confirmation page with response details

## Components

- `LoadingSpinner`: Reusable loading component
- `SplashScreen`: Initial loading screen
- `PublicNavigation`: Navigation bar for public pages 
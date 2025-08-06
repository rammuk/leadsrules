export const publicConfig = {
  websiteId: process.env.PUBLIC_WEBSITE_ID || 'cmdzpqebx000006n6thndhgam',
  websiteName: process.env.PUBLIC_WEBSITE_NAME || 'Sample Website',
  apiBaseUrl: process.env.PUBLIC_API_BASE_URL || 'http://localhost:3005/api',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/leadsrules'
} 
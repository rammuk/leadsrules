
      const { execSync } = require('child_process')
      
      try {
        // Get the DATABASE_URL from Vercel environment
        const result = execSync('vercel env pull .env.temp --environment=production', { encoding: 'utf8' })
        console.log('✅ Downloaded production environment variables')
        
        // Read the DATABASE_URL from the temp file
        const envContent = require('fs').readFileSync('.env.temp', 'utf8')
        const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
        
        if (dbUrlMatch) {
          console.log('✅ Found DATABASE_URL in production environment')
          process.env.DATABASE_URL = dbUrlMatch[1]
        } else {
          console.log('❌ DATABASE_URL not found in production environment')
          process.exit(1)
        }
        
        // Clean up temp file
        require('fs').unlinkSync('.env.temp')
        
      } catch (error) {
        console.error('❌ Error getting production database URL:', error.message)
        process.exit(1)
      }
    
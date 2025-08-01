const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

/**
 * Push schema to production database
 */
async function pushSchemaToProduction() {
  try {
    console.log('🚀 Pushing schema to production...')
    
    // First, let's get the production database URL from Vercel
    console.log('📡 Getting production database URL from Vercel...')
    
    // Create a temporary script to get the DATABASE_URL from Vercel
    const tempScript = `
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
    `
    
    // Write and execute the temp script
    fs.writeFileSync('temp-get-db-url.js', tempScript)
    require('./temp-get-db-url.js')
    fs.unlinkSync('temp-get-db-url.js')
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ Could not get production DATABASE_URL')
      return
    }
    
    console.log('🔗 Using production database URL')
    
    // Now push the schema to production
    console.log('📊 Pushing schema to production database...')
    
    const productionPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
    
    // Test the connection
    console.log('🔍 Testing production database connection...')
    await productionPrisma.$connect()
    console.log('✅ Successfully connected to production database')
    
    // Push the schema
    console.log('📋 Pushing schema changes...')
    
    // Use Prisma CLI to push schema
    const pushCommand = `DATABASE_URL="${process.env.DATABASE_URL}" npx prisma db push --accept-data-loss`
    console.log(`Running: ${pushCommand}`)
    
    try {
      execSync(pushCommand, { stdio: 'inherit' })
      console.log('✅ Schema successfully pushed to production!')
    } catch (error) {
      console.error('❌ Error pushing schema:', error.message)
    }
    
    // Verify the schema
    console.log('🔍 Verifying schema in production...')
    
    try {
      // Try to query the GeoIPData table
      const count = await productionPrisma.geoIPData.count()
      console.log(`✅ GeoIPData table exists with ${count} records`)
    } catch (error) {
      console.log('❌ GeoIPData table does not exist or is not accessible')
      console.log('Error:', error.message)
    }
    
    await productionPrisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error during schema push:', error)
  }
}

// Run the schema push
pushSchemaToProduction() 
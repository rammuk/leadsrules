import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 Fetching production database statistics...')
    
    // Get basic counts
    const websiteCount = await prisma.website.count()
    const questionnaireCount = await prisma.questionnaire.count()
    const questionBankCount = await prisma.questionBank.count()
    
    const stats = {
      websiteCount,
      questionnaireCount,
      questionBankCount
    }
    
    console.log(`✅ Fetched stats: ${websiteCount} websites, ${questionnaireCount} questionnaires, ${questionBankCount} question banks`)
    
    return NextResponse.json({
      stats
    })
    
  } catch (error) {
    console.error('❌ Error fetching database stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 
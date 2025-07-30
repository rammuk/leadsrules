import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../lib/db'

// GET /api/question-bank - Get all questions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questions = await prisma.questionBank.findMany({
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/question-bank - Create new question
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, displayType, isMultiSelect, options } = await request.json()

    if (!question || !options || !Array.isArray(options)) {
      return NextResponse.json({ error: 'Question and options are required' }, { status: 400 })
    }

    const questionBank = await prisma.questionBank.create({
      data: {
        question,
        displayType: displayType || 'list',
        isMultiSelect: isMultiSelect || false,
        options: {
          create: options.map((option, index) => ({
            description: option.description,
            image: option.image || null,
            order: index
          }))
        }
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(questionBank, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
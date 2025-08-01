import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../lib/prisma'

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

    const { question, questionType, displayType, isMultiSelect, options, validationRules } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    // For options type, validate options
    if (questionType === 'options' && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ error: 'At least one option is required for multiple choice questions' }, { status: 400 })
    }

    const newQuestion = await prisma.questionBank.create({
      data: {
        question,
        questionType: questionType || 'options',
        displayType: displayType || 'list',
        isMultiSelect: isMultiSelect || false,
        validationRules: validationRules || null,
        options: questionType === 'options' ? {
          create: options.map((option, index) => ({
            description: option.description,
            image: option.image || null,
            order: index
          }))
        } : undefined
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
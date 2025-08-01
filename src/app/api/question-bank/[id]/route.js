import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

// GET /api/question-bank/[id] - Get specific question
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const question = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/question-bank/[id] - Update question
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { question, questionType, displayType, isMultiSelect, options, validationRules } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    // For options type, validate options
    if (questionType === 'options' && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ error: 'At least one option is required for multiple choice questions' }, { status: 400 })
    }

    // Delete existing options if changing from options type to another type
    if (questionType !== 'options') {
      await prisma.questionOption.deleteMany({
        where: { questionBankId: id }
      })
    } else {
      // Delete existing options and recreate them for options type
      await prisma.questionOption.deleteMany({
        where: { questionBankId: id }
      })
    }

    const updatedQuestion = await prisma.questionBank.update({
      where: { id },
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

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/question-bank/[id] - Delete question
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.questionBank.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
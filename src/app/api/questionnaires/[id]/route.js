import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        website: true,
        steps: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 })
    }

    return NextResponse.json(questionnaire)
  } catch (error) {
    console.error('Error fetching questionnaire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { title, description, isActive, steps } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Delete existing steps and their questions
    await prisma.stepQuestionOption.deleteMany({
      where: {
        stepQuestion: {
          step: {
            questionnaireId: id
          }
        }
      }
    })

    await prisma.stepQuestion.deleteMany({
      where: {
        step: {
          questionnaireId: id
        }
      }
    })

    await prisma.questionnaireStep.deleteMany({
      where: { questionnaireId: id }
    })

    const updatedQuestionnaire = await prisma.questionnaire.update({
      where: { id },
      data: {
        title,
        description,
        isActive: isActive !== undefined ? isActive : true,
        steps: steps ? {
          create: steps.map((step, stepIndex) => ({
            title: step.title,
            description: step.description,
            order: stepIndex,
            isActive: step.isActive !== undefined ? step.isActive : true,
            leaveBehindStrategy: step.leaveBehindStrategy !== undefined ? step.leaveBehindStrategy : false,
            showStepTitle: step.showStepTitle !== undefined ? step.showStepTitle : true,
            showQuestionTitles: step.showQuestionTitles !== undefined ? step.showQuestionTitles : true,
            questions: step.questions ? {
              create: step.questions.map((question, questionIndex) => ({
                question: question.question,
                questionType: question.questionType || 'options',
                displayType: question.displayType || 'list',
                isMultiSelect: question.isMultiSelect || false,
                isRequired: question.isRequired || false,
                validationRules: question.validationRules || null,
                order: questionIndex,
                isActive: question.isActive !== undefined ? question.isActive : true,
                questionBankId: question.questionBankId || null,
                options: question.options ? {
                  create: question.options.map((option, optionIndex) => ({
                    description: option.description,
                    image: option.image || null,
                    order: optionIndex
                  }))
                } : undefined
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        website: true,
        steps: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedQuestionnaire)
  } catch (error) {
    console.error('Error updating questionnaire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete questionnaire (cascade will handle steps and questions)
    await prisma.questionnaire.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Questionnaire deleted successfully' })
  } catch (error) {
    console.error('Error deleting questionnaire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
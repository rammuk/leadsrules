import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questionnaires = await prisma.questionnaire.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error('Error fetching questionnaires:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, websiteId, steps } = await request.json()

    if (!title || !websiteId) {
      return NextResponse.json({ error: 'Title and website ID are required' }, { status: 400 })
    }

    // Check if website already has a questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findFirst({
      where: { websiteId }
    })

    if (existingQuestionnaire) {
      return NextResponse.json({ error: 'Website already has a questionnaire' }, { status: 400 })
    }

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description,
        websiteId,
        ...(steps && steps.length > 0 ? {
          steps: {
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
          }
        } : {})
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

    return NextResponse.json(questionnaire)
  } catch (error) {
    console.error('Error creating questionnaire:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
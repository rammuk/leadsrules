import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const { identifier, id } = await params
    const body = await request.json()
    const { questionnaireId, answers } = body

    // Validate that the questionnaire exists and belongs to the website
    const questionnaire = await prisma.questionnaire.findFirst({
      where: {
        id: questionnaireId,
        websiteId: identifier,
        isActive: true
      }
    })

    if (!questionnaire) {
      return Response.json({ error: 'Questionnaire not found' }, { status: 404 })
    }

    // Create the response record
    const response = await prisma.response.create({
      data: {
        questionnaireId: questionnaireId,
        answers: answers,
        submittedAt: new Date()
      }
    })

    return Response.json({ 
      success: true, 
      responseId: response.id,
      message: 'Questionnaire submitted successfully' 
    })
  } catch (error) {
    console.error('Error submitting questionnaire response:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
import { prisma } from '@/lib/prisma'
import QuestionnaireForm from '@/components/ui/questionnaire-form'

export default async function EditQuestionnairePage({ params }) {
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
    return <div>Questionnaire not found</div>
  }

  return <QuestionnaireForm mode="edit" questionnaire={questionnaire} />
} 
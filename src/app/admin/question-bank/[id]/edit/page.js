import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../api/auth/[...nextauth]/route"
import { prisma } from "../../../../../lib/prisma"
import QuestionBankForm from "../../../../../components/ui/question-bank-form"

export default async function EditQuestionPage({ params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  const { id } = await params

  const question = await prisma.questionBank.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!question) {
    redirect("/admin/question-bank")
  }

  return <QuestionBankForm mode="edit" question={question} />
} 
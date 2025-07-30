import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import QuestionBankForm from "../../../../components/ui/question-bank-form"

export default async function NewQuestionPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  return <QuestionBankForm mode="create" />
} 
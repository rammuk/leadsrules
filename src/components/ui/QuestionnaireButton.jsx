'use client'

import { Button } from '@chakra-ui/react'

export default function QuestionnaireButton({ questionnaire }) {
  const handleStartQuestionnaire = () => {
    sessionStorage.setItem('questionnaireData', JSON.stringify(questionnaire))
    window.location.href = '/public/questionnaire'
  }

  return (
    <Button 
      size="lg" 
      colorPalette="blue" 
      w="full"
      onClick={handleStartQuestionnaire}
    >
      Start Questionnaire
    </Button>
  )
} 
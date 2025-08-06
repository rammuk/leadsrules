import { Input, Textarea, Button, VStack, HStack, Text, Box, Image } from '@chakra-ui/react'

export default function QuestionRenderer({ question, value, onAnswerChange }) {

  switch (question.questionType) {
    case 'text':
      return (
        <Input
          value={value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer"
          required={question.isRequired}
          size="lg"
        />
      )
    
    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer"
          rows={4}
          required={question.isRequired}
          size="lg"
        />
      )
    
    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          required={question.isRequired}
          size="lg"
        />
      )
    
    case 'options':
      return (
        <VStack gap={3} align="stretch">
          {question.options.map((option) => (
            <Button
              key={option.id}
              variant={value === option.description ? 'solid' : 'outline'}
              colorPalette="blue"
              onClick={() => onAnswerChange(question.id, option.description)}
              justifyContent="flex-start"
              h="auto"
              p={4}
              borderRadius="lg"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
            >
              <VStack gap={3} align="center" w="full">
                {/* Radio button */}
                {!option.image &&<HStack gap={2} w="full" justify="flex-start">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={value === option.description ? "blue.500" : "gray.300"}
                    bg={value === option.description ? "blue.500" : "transparent"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {value === option.description && (
                      <Box w="8px" h="8px" borderRadius="full" bg="white" />
                    )}
                  </Box>
                  <Text fontWeight="medium" fontSize="md">{option.description}</Text>
                </HStack>
  }
                {/* Image display */}
                {option.image && (
                  <VStack gap={2} align="center" w="full">
                    <Image
                      src={option.image}
                      alt={option.description}
                      maxW="200px"
                      maxH="150px"
                      objectFit="contain"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    />
                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                      {option.description}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </Button>
          ))}
        </VStack>
      )
    
    default:
      return <Text color="fg.muted">Unsupported question type</Text>
  }
} 
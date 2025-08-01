import { Card, Heading, Text, VStack, HStack, Button, Badge, Box, Skeleton } from '@chakra-ui/react'
import Link from 'next/link'
import { publicConfig } from '@/config/public'
import PublicNavigation from '@/components/ui/PublicNavigation'
import QuestionnaireButton from '@/components/ui/QuestionnaireButton'
import GeoIPInfo from '@/components/ui/GeoIPInfo'
import GeoIPComparison from '@/components/ui/GeoIPComparison'
import { prisma } from '@/lib/prisma'


console.log('publicConfig', publicConfig)

async function getWebsiteInfo() {
  try {
    // Try to find website by ID first, then by identifier
    let website = await prisma.website.findUnique({
      where: {
        id: publicConfig.websiteId
      },
      include: {
        questionnaires: {
          where: {
            isActive: true
          },
          include: {
            steps: {
              where: {
                isActive: true
              },
              orderBy: {
                order: 'asc'
              },
              include: {
                questions: {
                  where: {
                    isActive: true
                  },
                  orderBy: {
                    order: 'asc'
                  },
                  include: {
                    options: {
                      orderBy: {
                        order: 'asc'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // If not found by ID, try by identifier
    if (!website) {
      website = await prisma.website.findFirst({
        where: {
          identifier: publicConfig.websiteId
        },
        include: {
          questionnaires: {
            where: {
              isActive: true
            },
            include: {
              steps: {
                where: {
                  isActive: true
                },
                orderBy: {
                  order: 'asc'
                },
                include: {
                  questions: {
                    where: {
                      isActive: true
                    },
                    orderBy: {
                      order: 'asc'
                    },
                    include: {
                      options: {
                        orderBy: {
                          order: 'asc'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
    return { website, dbStatus: 'connected' }
  } catch (error) {
    console.error('Database connection error:', error)
    return { website: null, dbStatus: 'disconnected', error: error.message }
  }
}

export default async function PublicWelcomePage() {
  const { website, dbStatus, error } = await getWebsiteInfo()
  console.log('website', website)
  
  return (
    <Box minH="100vh" bg="gray.50">
      <PublicNavigation websiteName={website?.name || publicConfig.websiteName} />
      <Box p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
        {/* Header */}
        <Card.Root w="full">
          <Card.Body>
            <VStack gap={4} align="center">
              {website?.logo && (
                <Box>
                  <img 
                    src={website.logo} 
                    alt={`${website.name} logo`}
                    style={{
                      maxHeight: '80px',
                      maxWidth: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
              <Heading size="2xl" textAlign="center">
                Welcome to {website?.name || 'Our Website'}
              </Heading>
              <Text fontSize="lg" color="fg.muted" textAlign="center">
                Please take a moment to complete our questionnaire
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* System Status */}
        <Card.Root w="full">
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="md">System Status</Heading>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Website ID:</Text>
                <Badge colorPalette="blue" variant="subtle">
                  {website?.id || 'Not Found'}
                </Badge>
              </HStack>

              {website?.phone && (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Phone:</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {website.phone}
                  </Text>
                </HStack>
              )}

              {website?.logo && (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Logo URL:</Text>
                  <Text fontSize="sm" color="fg.muted" maxW="200px" overflow="hidden" textOverflow="ellipsis">
                    {website.logo}
                  </Text>
                </HStack>
              )}

              <HStack justify="space-between">
                <Text fontWeight="medium">Database Status:</Text>
                <Badge 
                  colorPalette={dbStatus === 'connected' ? 'green' : 'red'}
                  variant={dbStatus === 'connected' ? 'solid' : 'subtle'}
                >
                  {dbStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
              </HStack>

              {error && (
                <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                  <Text fontSize="sm" color="red.600">
                    <strong>Error:</strong> {error}
                  </Text>
                </Box>
              )}

              {website?.questionnaires?.length > 0 ? (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Questionnaire Status:</Text>
                  <Badge colorPalette="green" variant="solid">
                    Available
                  </Badge>
                </HStack>
              ) : (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Questionnaire Status:</Text>
                  <Badge colorPalette="gray" variant="subtle">
                    Not Available
                  </Badge>
                </HStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* GeoIP Information */}
        <Card.Root w="full">
          <Card.Body>
            <GeoIPInfo />
          </Card.Body>
        </Card.Root>

        {/* GeoIP Performance Comparison */}
        <Card.Root w="full">
          <Card.Body>
            <GeoIPComparison />
          </Card.Body>
        </Card.Root>

        {/* Action Buttons */}
        <Card.Root w="full">
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Heading size="md">Get Started</Heading>
              
              {website?.questionnaires?.length > 0 ? (
                <VStack gap={3}>
                  <Text color="fg.muted" textAlign="center">
                    We have an active questionnaire with {website.questionnaires[0].steps.length} steps.
                  </Text>
                  <QuestionnaireButton questionnaire={website.questionnaires[0]} />
                </VStack>
              ) : (
                <VStack gap={3}>
                  <Text color="fg.muted" textAlign="center">
                    No active questionnaire is available at the moment.
                  </Text>
                  <Button size="lg" variant="outline" disabled w="full">
                    Questionnaire Unavailable
                  </Button>
                </VStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Footer */}
        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <VStack gap={2} align="center">
              <Text fontSize="sm" color="fg.muted" textAlign="center">
                This is a sample questionnaire system with GeoIP location detection
              </Text>
              <Text fontSize="xs" color="fg.muted" textAlign="center">
                Website ID: {website?.id || 'N/A'} | 
                Database: {dbStatus} | 
                API: {publicConfig.apiBaseUrl}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
        </VStack>
      </Box>
    </Box>
  )
} 
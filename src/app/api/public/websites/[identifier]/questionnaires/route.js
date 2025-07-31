import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { identifier } = await params

    // Try to find website by ID first, then by identifier
    let website = await prisma.website.findUnique({
      where: {
        id: identifier
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
          identifier: identifier
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

    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 })
    }

    return Response.json(website)
  } catch (error) {
    console.error('Error fetching website data:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
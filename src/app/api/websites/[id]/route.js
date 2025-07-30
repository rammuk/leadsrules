import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/db'

// GET /api/websites/[id] - Get specific website
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        questionnaires: {
          include: {
            questions: true,
            responses: true
          }
        }
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error fetching website:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/websites/[id] - Update website
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { name, identifier, isActive } = await request.json()

    if (!name || !identifier) {
      return NextResponse.json({ error: 'Name and identifier are required' }, { status: 400 })
    }

    // Check if identifier already exists for other websites
    const existingWebsite = await prisma.website.findFirst({
      where: {
        identifier,
        id: { not: id }
      }
    })

    if (existingWebsite) {
      return NextResponse.json({ error: 'Identifier already exists' }, { status: 400 })
    }

    const website = await prisma.website.update({
      where: { id },
      data: {
        name,
        identifier,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error updating website:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/websites/[id] - Delete website
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if website has questionnaires
    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        questionnaires: true
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    if (website.questionnaires.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete website with existing questionnaires' 
      }, { status: 400 })
    }

    await prisma.website.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Website deleted successfully' })
  } catch (error) {
    console.error('Error deleting website:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
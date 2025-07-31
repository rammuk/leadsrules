import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../lib/db'

// GET /api/websites - Get all websites
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const websites = await prisma.website.findMany({
      include: {
        questionnaire: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/websites - Create new website
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, identifier } = await request.json()

    if (!name || !identifier) {
      return NextResponse.json({ error: 'Name and identifier are required' }, { status: 400 })
    }

    // Check if identifier already exists
    const existingWebsite = await prisma.website.findUnique({
      where: { identifier }
    })

    if (existingWebsite) {
      return NextResponse.json({ error: 'Identifier already exists' }, { status: 400 })
    }

    const website = await prisma.website.create({
      data: {
        name,
        identifier
      }
    })

    return NextResponse.json(website, { status: 201 })
  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
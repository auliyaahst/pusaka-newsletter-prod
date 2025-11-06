import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Editors, Publishers and above can see all editions to assign articles to
    if (!['EDITOR', 'PUBLISHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    // Fetch all editions (both published and draft) for editorial use
    const editions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        publishDate: true,
        editionNumber: true,
        isPublished: true,
        coverImage: true,  // ← ADD THIS LINE
        theme: true,       // ← ADD THIS LINE
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
    })

    return NextResponse.json({ editions })
  } catch (error) {
    console.error('Error fetching editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('📝 POST /api/editorial/editions - Session:', {
      user: session?.user?.email,
      role: session?.user?.role,
      hasSession: !!session?.user
    })
    
    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Editors, Publishers and above can create editions
    const allowedRoles = ['EDITOR', 'PUBLISHER', 'ADMIN', 'SUPER_ADMIN']
    const userRole = session.user.role || ''
    
    console.log('🔐 Role check:', {
      userRole,
      allowedRoles,
      isAllowed: allowedRoles.includes(userRole)
    })
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Role not allowed:', userRole)
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, publishDate, editionNumber, theme } = body

    console.log('📊 Request body:', {
      title,
      description,
      publishDate,
      editionNumber,
      theme
    })

    if (!title || !publishDate) {
      console.log('❌ Missing required fields:', { title: !!title, publishDate: !!publishDate })
      return NextResponse.json(
        { error: 'Title and publish date are required' },
        { status: 400 }
      )
    }

    // Check if edition number already exists
    if (editionNumber) {
      console.log('🔍 Checking if edition number exists:', editionNumber)
      const existingEdition = await prisma.edition.findFirst({
        where: { editionNumber: parseInt(editionNumber) }
      })
      
      if (existingEdition) {
        console.log('❌ Edition number already exists:', editionNumber)
        return NextResponse.json(
          { error: 'Edition number already exists' },
          { status: 400 }
        )
      }
    }

    console.log('💾 Creating new edition...')
    const edition = await prisma.edition.create({
      data: {
        title,
        description: description || null,
        publishDate: new Date(publishDate),
        editionNumber: editionNumber ? parseInt(editionNumber) : null,
        theme: theme || null,
        isPublished: true, // Editions created by editors are automatically published
      },
      select: {
        id: true,
        title: true,
        description: true,
        publishDate: true,
        editionNumber: true,
        isPublished: true,
      },
    })

    console.log('✅ Edition created successfully:', edition.id)
    return NextResponse.json(
      { 
        message: 'Edition created successfully',
        edition 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('💥 Error creating edition:', error)
    console.error('📊 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to create edition' },
      { status: 500 }
    )
  }
}

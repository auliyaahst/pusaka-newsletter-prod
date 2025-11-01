import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can access all editions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const editions = await prisma.edition.findMany({
      orderBy: [
        { publishDate: 'desc' },
      ],
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' },
          ],
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ editions }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching admin editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can create editions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, publishDate, editionNumber, theme, coverImage } = body

    if (!title || !publishDate) {
      return NextResponse.json(
        { error: 'Title and publish date are required' },
        { status: 400 }
      )
    }

    // Check if edition number already exists
    if (editionNumber) {
      const existingEdition = await prisma.edition.findFirst({
        where: { editionNumber: parseInt(editionNumber) }
      })
      
      if (existingEdition) {
        return NextResponse.json(
          { error: 'Edition number already exists' },
          { status: 400 }
        )
      }
    }

    const edition = await prisma.edition.create({
      data: {
        title,
        description: description || null,
        publishDate: new Date(publishDate),
        editionNumber: editionNumber ? parseInt(editionNumber) : null,
        theme: theme || null,
        coverImage: coverImage || null,
        isPublished: true, // Editions created by admins are automatically published
      },
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      { 
        message: 'Edition created successfully',
        edition 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating edition:', error)
    return NextResponse.json(
      { error: 'Failed to create edition' },
      { status: 500 }
    )
  }
}

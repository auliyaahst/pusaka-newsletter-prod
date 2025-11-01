import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'

// API endpoint for editorial articles - filters by author
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Valid status values based on Prisma schema
    const validStatuses = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED']
    const statusFilter = status && status !== 'ALL' && validStatuses.includes(status) ? status : null

    const articles = await prisma.article.findMany({
      where: {
        // Only show articles created by the current user (editor)
        authorId: session.user.id,
        ...(statusFilter ? { status: statusFilter as ArticleStatus } : {}),
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
        reviewNotes: {
          include: {
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json({ articles }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching articles for editorial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      slug,
      editionId,
      featured,
      readTime,
      metaTitle,
      metaDescription,
      status
    } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the article
    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        slug,
        status: status || 'DRAFT',
        featured: featured || false,
        readTime: readTime || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        editionId: editionId || null,
        authorId: session.user.id, // Set the current user as the author
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      article,
      message: 'Article created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

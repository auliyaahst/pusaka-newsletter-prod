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
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        featured: true,
        readTime: true,
        editionId: true,
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
  console.log('📝 POST /api/editorial/articles - Creating new article')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('👤 Session check - User:', session?.user?.email, 'Role:', session?.user?.role)
    
    if (!session?.user?.role || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
      console.log('❌ Unauthorized - User role:', session?.user?.role, 'Required: EDITOR/SUPER_ADMIN')
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    console.log('✅ Authorization passed - User can create articles')
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))
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

    console.log('📊 Creating article with data:', { 
      title, 
      slug, 
      editionId, 
      featured, 
      status: status || 'DRAFT',
      contentLength: content?.length || 0,
      excerptLength: excerpt?.length || 0 
    })

    // Validate required fields
    if (!title || !content || !slug) {
      console.log('❌ Validation failed - Missing required fields:', { 
        title: !!title, 
        content: !!content, 
        slug: !!slug 
      })
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    console.log('🔍 Checking for existing slug:', slug)
    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      console.log('❌ Slug conflict - Article with slug already exists:', slug)
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      )
    }

    console.log('✅ Slug is available, proceeding with article creation')
    console.log('💾 Creating article in database...')

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

    console.log('✅ Article created successfully:', {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      featured: article.featured,
      authorId: article.authorId,
      editionId: article.editionId,
      authorName: article.author?.name || 'Unknown'
    })

    return NextResponse.json({ 
      article,
      message: 'Article created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('💥 Error creating article:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

// Mock articles data (shared with the [id] route)
let mockArticles = [
  {
    id: 'article-1',
    title: 'Sample Article 1',
    content: 'This is sample content for article 1.',
    excerpt: 'Sample excerpt 1',
    slug: 'sample-article-1',
    editionId: 'edition-1',
    featured: false,
    readTime: 5,
    metaTitle: 'Sample Meta Title 1',
    metaDescription: 'Sample meta description 1',
    contentType: 'HTML',
    status: 'DRAFT',
    authorId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: null,
    author: {
      id: 'user-1',
      name: 'Sample Author',
      email: 'author@example.com',
      role: 'EDITOR'
    },
    edition: {
      id: 'edition-1',
      title: 'Edition 1',
      editionNumber: 1
    },
    reviewNotes: []
  },
  {
    id: 'article-2',
    title: 'Sample Article 2',
    content: 'This is sample content for article 2.',
    excerpt: 'Sample excerpt 2',
    slug: 'sample-article-2',
    editionId: 'edition-1',
    featured: true,
    readTime: 8,
    metaTitle: 'Sample Meta Title 2',
    metaDescription: 'Sample meta description 2',
    contentType: 'HTML',
    status: 'PUBLISHED',
    authorId: 'user-1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    publishedAt: new Date('2024-01-02'),
    author: {
      id: 'user-1',
      name: 'Sample Author',
      email: 'author@example.com',
      role: 'EDITOR'
    },
    edition: {
      id: 'edition-1',
      title: 'Edition 1',
      editionNumber: 1
    },
    reviewNotes: []
  }
]

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

    // Filter articles by status if specified
    let filteredArticles = mockArticles
    if (statusFilter) {
      filteredArticles = mockArticles.filter(article => article.status === statusFilter)
    }

    // For EDITOR role (not SUPER_ADMIN), only show their own articles
    if (session.user.role === 'EDITOR') {
      filteredArticles = filteredArticles.filter(article => article.authorId === session.user.id)
    }

    console.log('📚 [WORKING] Fetched mock articles:', {
      total: filteredArticles.length,
      status: statusFilter || 'ALL',
      userRole: session.user.role
    })

    return NextResponse.json({ articles: filteredArticles }, {
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
      contentType
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const slugExists = mockArticles.find(article => article.slug === slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Create new article
    const newArticle: any = {
      id: `article-${Date.now()}`,
      title,
      content,
      excerpt: excerpt || null,
      slug,
      editionId: editionId || null,
      featured: featured || false,
      readTime: readTime || 5,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      contentType: contentType || 'HTML',
      status: 'DRAFT' as const,
      authorId: session.user.id!,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      author: {
        id: session.user.id!,
        name: session.user.name || 'Unknown',
        email: session.user.email || '',
        role: session.user.role as string
      },
      edition: editionId ? {
        id: editionId,
        title: 'Sample Edition',
        editionNumber: 1
      } : {
        id: 'default-edition',
        title: 'Default Edition',
        editionNumber: 1
      },
      reviewNotes: []
    }

    // Add to mock articles array
    mockArticles.push(newArticle)

    console.log('✨ [WORKING] Created mock article:', {
      id: newArticle.id,
      title: newArticle.title,
      authorId: newArticle.authorId
    })

    return NextResponse.json({
      message: 'Article created successfully',
      article: newArticle
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

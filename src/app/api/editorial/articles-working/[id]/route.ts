import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/* eslint-disable prefer-const */

// Mock articles data (in production, this could be stored in Redis or a file)
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
    edition: {
      id: 'edition-1',
      title: 'Edition 1',
      editionNumber: 1
    }
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
    edition: {
      id: 'edition-1',
      title: 'Edition 1',
      editionNumber: 1
    }
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has EDITOR or SUPER_ADMIN role
    if (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
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
      contentType,
      status
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Find the article in mock data
    const articleIndex = mockArticles.findIndex(article => article.id === id)
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    const existingArticle = mockArticles[articleIndex]

    // Check if slug is unique (excluding current article)
    if (slug !== existingArticle.slug) {
      const slugExists = mockArticles.find(article => 
        article.slug === slug && article.id !== id
      )

      if (slugExists) {
        return NextResponse.json(
          { message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update the article in mock data
    const updatedArticle = {
      ...existingArticle,
      title,
      content,
      excerpt: excerpt || null,
      slug,
      editionId: editionId || existingArticle.editionId,
      featured: featured || false,
      readTime: readTime || 5,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      contentType: contentType || 'HTML',
      status: status || existingArticle.status,
      updatedAt: new Date(),
      // Keep edition data
      edition: existingArticle.edition
    }

    // Update in the array
    mockArticles[articleIndex] = updatedArticle

    console.log('📝 [WORKING] Updated mock article:', {
      id: updatedArticle.id,
      title: updatedArticle.title,
      status: updatedArticle.status,
      slug: updatedArticle.slug
    })

    return NextResponse.json({
      message: 'Article updated successfully',
      article: updatedArticle
    })

  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has EDITOR or SUPER_ADMIN role
    if (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find and remove the article from mock data
    const articleIndex = mockArticles.findIndex(article => article.id === id)
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const deletedArticle = mockArticles.splice(articleIndex, 1)[0]
    
    console.log('🗑️ [WORKING] Deleted mock article:', {
      id: deletedArticle.id,
      title: deletedArticle.title
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Article deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has EDITOR or SUPER_ADMIN role
    if (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find the article in mock data
    const article = mockArticles.find(article => article.id === id)
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    console.log('📖 [WORKING] Retrieved mock article:', {
      id: article.id,
      title: article.title
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'PUBLISHER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Publisher access required' },
        { status: 403 }
      )
    }

    const { id: articleId } = await params

    // Check if article exists and is approved
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (existingArticle.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved articles can be published' },
        { status: 400 }
      )
    }

    // Update article status to PUBLISHED
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'PUBLISHED',
        // Ensure publishedAt is set if not already
        ...((!existingArticle.publishedAt) && {
          publishedAt: new Date(),
        }),
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
      article: updatedArticle,
      message: 'Article published successfully' 
    })
  } catch (error) {
    console.error('Error publishing article:', error)
    return NextResponse.json(
      { error: 'Failed to publish article' },
      { status: 500 }
    )
  }
}

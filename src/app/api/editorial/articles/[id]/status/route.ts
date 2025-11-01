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
    
    if (!session?.user?.role || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const { status } = await request.json()
    const { id: articleId } = await params

    // Validate status
    const validStatuses = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Update article status
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        ...(status === 'PUBLISHED' && !existingArticle.publishedAt && {
          publishedAt: new Date(),
        }),
      },
      include: {
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
      message: `Article status updated to ${status}` 
    })
  } catch (error) {
    console.error('Error updating article status:', error)
    return NextResponse.json(
      { error: 'Failed to update article status' },
      { status: 500 }
    )
  }
}

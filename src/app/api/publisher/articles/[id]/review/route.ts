import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const { decision, note, highlights } = await request.json()
    const { id: articleId } = await params

    // Validate decision
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Check if article exists and is under review
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (existingArticle.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Article is not under review' },
        { status: 400 }
      )
    }

    // Get reviewer ID from session
    const reviewer = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!reviewer) {
      return NextResponse.json(
        { error: 'Reviewer not found' },
        { status: 404 }
      )
    }

    // Start a transaction to update article and create review note
    const result = await prisma.$transaction(async (tx) => {
      // Update article with review decision
      const updatedArticle = await tx.article.update({
        where: { id: articleId },
        data: {
          status: decision === 'APPROVED' ? 'PUBLISHED' : decision,
          ...(decision === 'APPROVED' && !existingArticle.publishedAt && {
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

      // Create review note if provided
      let reviewNote = null
      if (note && note.trim()) {
        reviewNote = await tx.reviewNote.create({
          data: {
            note: note.trim(),
            decision,
            articleId,
            reviewerId: reviewer.id,
            highlights: highlights || undefined,
          },
          include: {
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
      }

      return { updatedArticle, reviewNote }
    })

    return NextResponse.json({ 
      article: result.updatedArticle,
      reviewNote: result.reviewNote,
      message: `Article ${decision.toLowerCase()} successfully` 
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

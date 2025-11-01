import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'PUBLISHER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Publisher access required' },
        { status: 403 }
      )
    }

    // Get time range for filtering
    const now = new Date()
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get reviewer ID
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

    // Get review counts by status
    const articleCounts = await prisma.article.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const reviewCounts = {
      total: 0,
      pending: 0,
      approved: 0,
      published: 0,
      rejected: 0,
    }

    articleCounts.forEach((count) => {
      reviewCounts.total += count._count.status
      switch (count.status) {
        case 'UNDER_REVIEW':
          reviewCounts.pending = count._count.status
          break
        case 'APPROVED':
          reviewCounts.approved = count._count.status
          break
        case 'PUBLISHED':
          reviewCounts.published = count._count.status
          break
        case 'REJECTED':
          reviewCounts.rejected = count._count.status
          break
      }
    })

    // Get recent review activity by this reviewer
    const recentReviewNotes = await prisma.reviewNote.findMany({
      where: {
        reviewerId: reviewer.id,
        createdAt: {
          gte: thisMonthStart,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    })

    const recentActivity = recentReviewNotes.map((note) => ({
      id: note.id,
      articleTitle: note.article.title,
      action: `Reviewed and ${note.decision.toLowerCase()}`,
      timestamp: note.createdAt.toISOString(),
      status: note.decision,
    }))

    // Calculate performance metrics
    const [reviewsThisWeek, reviewsThisMonth] = await Promise.all([
      prisma.reviewNote.count({
        where: {
          reviewerId: reviewer.id,
          createdAt: {
            gte: thisWeekStart,
          },
        },
      }),
      prisma.reviewNote.count({
        where: {
          reviewerId: reviewer.id,
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
    ])

    // Calculate approval rate for this reviewer
    const reviewerApproved = await prisma.reviewNote.count({
      where: {
        reviewerId: reviewer.id,
        decision: 'APPROVED',
      },
    })

    const reviewerRejected = await prisma.reviewNote.count({
      where: {
        reviewerId: reviewer.id,
        decision: 'REJECTED',
      },
    })

    const totalReviewed = reviewerApproved + reviewerRejected
    const approvalRate = totalReviewed > 0 ? Math.round((reviewerApproved / totalReviewed) * 100) : 0

    // Simple average review time calculation (mock data for now)
    const averageReviewTime = 12 // hours - this would be calculated from actual review timestamps

    const statistics = {
      reviewCounts,
      recentActivity,
      performanceMetrics: {
        reviewsThisWeek,
        reviewsThisMonth,
        averageReviewTime,
        approvalRate,
      },
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching publisher statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

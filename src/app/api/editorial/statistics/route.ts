import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const range = searchParams.get('range') || 'month'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get article counts by status
    const articleCounts = await prisma.article.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const counts = {
      total: 0,
      draft: 0,
      underReview: 0,
      approved: 0,
      published: 0,
      rejected: 0,
    }

    articleCounts.forEach((count) => {
      counts.total += count._count.status
      switch (count.status) {
        case 'DRAFT':
          counts.draft = count._count.status
          break
        case 'UNDER_REVIEW':
          counts.underReview = count._count.status
          break
        case 'APPROVED':
          counts.approved = count._count.status
          break
        case 'PUBLISHED':
          counts.published = count._count.status
          break
        case 'REJECTED':
          counts.rejected = count._count.status
          break
      }
    })

    // Get recent activity (last 10 status changes)
    const recentArticles = await prisma.article.findMany({
      where: {
        updatedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        createdAt: true,
      },
    })

    const recentActivity = recentArticles.map((article) => ({
      id: article.id,
      title: article.title,
      action: `Status changed to ${article.status.replace('_', ' ')}`,
      timestamp: article.updatedAt.toISOString(),
      status: article.status,
    }))

    // Calculate productivity metrics
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [articlesThisWeek, articlesThisMonth] = await Promise.all([
      prisma.article.count({
        where: {
          createdAt: {
            gte: thisWeekStart,
          },
        },
      }),
      prisma.article.count({
        where: {
          createdAt: {
            gte: thisMonthStart,
          },
        },
      }),
    ])

    // Calculate approval rate (approved vs rejected)
    const totalReviewed = counts.approved + counts.rejected
    const approvalRate = totalReviewed > 0 ? Math.round((counts.approved / totalReviewed) * 100) : 0

    // Simple average review time calculation (mock data for now)
    const averageReviewTime = 24 // hours - this would be calculated from actual review timestamps

    const statistics = {
      articleCounts: counts,
      recentActivity,
      productivityMetrics: {
        articlesThisWeek,
        articlesThisMonth,
        averageReviewTime,
        approvalRate,
      },
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching editorial statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

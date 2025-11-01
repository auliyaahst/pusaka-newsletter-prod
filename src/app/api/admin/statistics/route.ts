import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '6months'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    // Basic counts
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    })

    const totalArticles = await prisma.article.count()
    const publishedArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    })

    const totalEditions = await prisma.edition.count()
    const publishedEditions = await prisma.edition.count({
      where: { isPublished: true }
    })

    // Revenue calculations
    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    })

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyRevenueResult = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })

    // User growth by month
    const userGrowthData = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      orderBy: { createdAt: 'asc' }
    })

    // Group by month
    const userGrowthByMonth: { [key: string]: number } = {}
    userGrowthData.forEach(item => {
      const monthKey = new Date(item.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      userGrowthByMonth[monthKey] = (userGrowthByMonth[monthKey] || 0) + item._count.id
    })

    const userGrowth = Object.entries(userGrowthByMonth).map(([month, users]) => ({
      month,
      users
    }))

    // Revenue by month
    const revenueData = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'PAID',
        createdAt: { gte: startDate }
      },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' }
    })

    const revenueByMonthData: { [key: string]: number } = {}
    revenueData.forEach(item => {
      const monthKey = new Date(item.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      revenueByMonthData[monthKey] = (revenueByMonthData[monthKey] || 0) + (item._sum.amount || 0)
    })

    const revenueByMonth = Object.entries(revenueByMonthData).map(([month, revenue]) => ({
      month,
      revenue
    }))

    // Subscription stats
    const freeTrialUsers = await prisma.user.count({
      where: { subscriptionType: 'FREE_TRIAL' }
    })

    const paidSubscriptions = await prisma.user.count({
      where: {
        subscriptionType: { not: 'FREE_TRIAL' },
        isActive: true
      }
    })

    const conversionRate = totalUsers > 0 ? (paidSubscriptions / totalUsers) * 100 : 0

    // Article stats
    const articleStats = await prisma.article.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const articleStatusCounts = {
      drafts: 0,
      underReview: 0,
      approved: 0,
      published: 0
    }

    articleStats.forEach(stat => {
      switch (stat.status) {
        case 'DRAFT':
          articleStatusCounts.drafts = stat._count.status
          break
        case 'UNDER_REVIEW':
          articleStatusCounts.underReview = stat._count.status
          break
        case 'APPROVED':
          articleStatusCounts.approved = stat._count.status
          break
        case 'PUBLISHED':
          articleStatusCounts.published = stat._count.status
          break
      }
    })

    // Top performing articles
    const topPerformingArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        readTime: true,
        featured: true,
      },
      orderBy: [
        { featured: 'desc' },
        { readTime: 'desc' }
      ],
      take: 5
    })

    const stats = {
      totalUsers,
      activeUsers,
      totalArticles,
      publishedArticles,
      totalEditions,
      publishedEditions,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
      userGrowth,
      subscriptionStats: {
        freeTrialUsers,
        paidSubscriptions,
        conversionRate
      },
      articleStats: articleStatusCounts,
      revenueByMonth,
      topPerformingArticles
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

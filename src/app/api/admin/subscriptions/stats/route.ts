import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get subscription stats
    const totalSubscriptions = await prisma.user.count()
    
    const activeSubscriptions = await prisma.user.count({
      where: {
        isActive: true,
        OR: [
          { subscriptionEnd: null },
          { subscriptionEnd: { gte: now } }
        ]
      }
    })

    const expiredSubscriptions = await prisma.user.count({
      where: {
        subscriptionEnd: { lt: now }
      }
    })

    const freeTrialUsers = await prisma.user.count({
      where: {
        subscriptionType: 'FREE_TRIAL'
      }
    })

    // Monthly revenue
    const monthlyPayments = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      _sum: {
        amount: true
      }
    })

    // Subscription breakdown
    const subscriptionsByType = await prisma.user.groupBy({
      by: ['subscriptionType'],
      _count: {
        subscriptionType: true
      }
    })

    const subscriptionBreakdown: { [key: string]: number } = {}
    subscriptionsByType.forEach(item => {
      subscriptionBreakdown[item.subscriptionType] = item._count.subscriptionType
    })

    const stats = {
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      freeTrialUsers,
      monthlyRevenue: monthlyPayments._sum.amount || 0,
      subscriptionsByType: subscriptionBreakdown
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching subscription stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

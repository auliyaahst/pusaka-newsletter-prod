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

    const subscriptions = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        isActive: true,
        createdAt: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const result = subscriptions.map(user => ({
      id: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      subscriptionType: user.subscriptionType,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      isActive: user.isActive,
      createdAt: user.createdAt,
      payments: user.payments,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

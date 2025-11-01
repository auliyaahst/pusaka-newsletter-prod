import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface UserUpdates {
  name?: string
  role?: 'CUSTOMER' | 'EDITOR' | 'PUBLISHER' | 'ADMIN'
  isActive?: boolean
  subscriptionType?: 'FREE_TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY'
  subscriptionStart?: string
  subscriptionEnd?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    // Don't allow updating sensitive fields directly
    const allowedUpdates = ['name', 'role', 'isActive', 'subscriptionType', 'subscriptionStart', 'subscriptionEnd']
    const filteredUpdates: Partial<UserUpdates> = {}
    
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key as keyof UserUpdates] = updates[key]
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: filteredUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Don't allow deleting the current admin user
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

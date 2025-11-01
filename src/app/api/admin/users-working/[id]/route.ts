import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface UserUpdates {
  name?: string
  role?: 'CUSTOMER' | 'EDITOR' | 'PUBLISHER' | 'ADMIN' | 'SUPER_ADMIN'
  isActive?: boolean
  subscriptionType?: 'FREE_TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY'
  subscriptionStart?: string
  subscriptionEnd?: string
}

interface MockUser {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'EDITOR' | 'PUBLISHER' | 'ADMIN' | 'SUPER_ADMIN'
  subscriptionType: 'FREE_TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY'
  subscriptionStart: string
  subscriptionEnd: string
  isActive: boolean
  createdAt: string
}

// Mock users data (shared with the main users endpoint)
// eslint-disable-next-line prefer-const
let mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'TP Super Admin',
    email: 'tpadmin@thepusaka.id',
    role: 'SUPER_ADMIN',
    subscriptionType: 'ANNUALLY',
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2', 
    name: 'Test User',
    email: 'test@example.com',
    role: 'CUSTOMER',
    subscriptionType: 'FREE_TRIAL',
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: '3',
    name: 'Editor User', 
    email: 'editor@example.com',
    role: 'EDITOR',
    subscriptionType: 'MONTHLY',
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-03-01').toISOString(),
  }
]

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

    // Find and update user
    const userIndex = mockUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...filteredUpdates }
    
    console.log('✅ [WORKING] Updated mock user:', mockUsers[userIndex].email)

    return NextResponse.json(mockUsers[userIndex])
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

    // Find user
    const userIndex = mockUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove user from array
    const deletedUser = mockUsers.splice(userIndex, 1)[0]
    
    console.log('🗑️ [WORKING] Deleted mock user:', deletedUser.email)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

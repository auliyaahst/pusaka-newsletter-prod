import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock users data (in production this would be from database)
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

// eslint-disable-next-line prefer-const
let mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'TP Super Admin',
    email: 'tpadmin@thepusaka.id',
    role: 'SUPER_ADMIN' as const,
    subscriptionType: 'ANNUALLY' as const,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2', 
    name: 'Test User',
    email: 'test@example.com',
    role: 'CUSTOMER' as const,
    subscriptionType: 'FREE_TRIAL' as const,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: '3',
    name: 'Editor User', 
    email: 'editor@example.com',
    role: 'EDITOR' as const,
    subscriptionType: 'MONTHLY' as const,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date('2024-03-01').toISOString(),
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 [WORKING] Fetching mock users for admin panel')
    
    return NextResponse.json(mockUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create new user
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      role: role as 'CUSTOMER' | 'EDITOR' | 'PUBLISHER' | 'ADMIN' | 'SUPER_ADMIN',
      subscriptionType: 'FREE_TRIAL',
      subscriptionStart: new Date().toISOString(),
      subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    
    console.log('✅ [WORKING] Created new mock user:', newUser.email)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

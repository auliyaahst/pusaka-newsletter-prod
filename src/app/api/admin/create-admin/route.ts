import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow existing admins to create new admin users
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin user already exists',
        admin: { email: existingAdmin.email }
      }, { status: 400 })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        subscriptionType: 'ANNUALLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
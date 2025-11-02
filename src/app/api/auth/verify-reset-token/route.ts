import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    console.log('🔍 Verifying reset token')

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!user) {
      console.log('❌ Invalid or expired reset token')
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 })
    }

    console.log('✅ Reset token verified successfully for user:', user.email)

    return NextResponse.json({ 
      message: 'Token is valid' 
    })

  } catch (error) {
    console.error('❌ Token verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}

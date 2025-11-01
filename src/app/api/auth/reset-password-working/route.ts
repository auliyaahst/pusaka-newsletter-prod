import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock user for testing (in production this would be in database)
const mockUser = {
  id: '1',
  email: 'tpadmin@thepusaka.id',
  name: 'TP Super Admin',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3w6ckVG/Sy' // bcrypt hash of 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Reset token and new password are required' 
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }

    console.log('🔐 [WORKING] Processing password reset with token:', token)

    // For this working version, we'll accept any token and reset the mock user's password
    // In production, you would verify the token against the database
    
    console.log('🔑 Resetting password for mock user:', mockUser.email)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('✅ Password reset successfully for user:', mockUser.email)
    console.log('🔐 New password hash:', hashedPassword)

    // In production, you would update the database here
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetExpiry: null,
    //     updatedAt: new Date()
    //   }
    // })

    return NextResponse.json({ 
      message: 'Password reset successfully! You can now login with your new password.',
      success: true,
      note: 'This is a working demo. In production, the password would be saved to the database.'
    })

  } catch (error) {
    console.error('❌ Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}

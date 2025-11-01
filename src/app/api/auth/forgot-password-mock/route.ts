import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Mock user data for testing
const mockUsers = [
  {
    id: '1',
    email: 'tpadmin@thepusaka.id',
    name: 'TP Super Admin',
    password: 'hashed_password'
  },
  {
    id: '2', 
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔐 [MOCK] Forgot password request for email:', email)

    // Find user by email (mock)
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      // Don't reveal if user exists for security reasons
      console.log('❌ [MOCK] User not found for email:', email)
      return NextResponse.json({ 
        message: '[MOCK MODE] If an account with that email exists, we\'ve sent a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log('🔑 [MOCK] Generated reset token for user:', user.id)

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    console.log('📧 [MOCK] Would send email to:', email)
    console.log('🔗 [MOCK] Reset URL:', resetUrl)

    // In mock mode, we'll return the reset URL for testing
    return NextResponse.json({ 
      message: '[MOCK MODE] Password reset email would be sent! Check console for reset URL.',
      resetUrl: resetUrl,
      mockMode: true
    })

  } catch (error) {
    console.error('❌ [MOCK] Forgot password error:', error)
    return NextResponse.json(
      { error: '[MOCK MODE] Failed to send reset email. Please try again.' },
      { status: 500 }
    )
  }
}

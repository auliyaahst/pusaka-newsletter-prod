import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()
    console.log('🔍 Verify OTP API called - email:', email, 'type:', type, 'otp length:', otp?.length)

    if (!email || !otp || !type) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Email, OTP, and type are required' }, { status: 400 })
    }

    console.log('👤 Looking up user in database')
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    console.log('🔍 User found, checking OTP validity')
    // Check if OTP exists and hasn't expired
    if (!user.otpCode || !user.otpExpiry) {
      console.log('❌ No OTP found in database')
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    const now = new Date()
    console.log('⏰ OTP expiry check - now:', now, 'expiry:', user.otpExpiry)
    if (now > user.otpExpiry) {
      console.log('❌ OTP has expired')
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    console.log('🔢 Comparing OTP codes')
    if (user.otpCode !== otp) {
      console.log('❌ OTP code mismatch')
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    console.log('✅ OTP verified successfully, updating user')
    // Clear OTP and mark as verified
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiry: null,
        isVerified: true,
        emailVerified: new Date()
      }
    })
    console.log('💾 User updated successfully')

    console.log('✅ Sending success response')
    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('💥 Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

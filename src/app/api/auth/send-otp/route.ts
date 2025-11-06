import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail, generateOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, type, password } = await request.json()
    console.log('🚀 Send OTP API called - email:', email, 'type:', type)

    if (!email || !type) {
      console.log('❌ Missing email or type')
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 })
    }

    // Exclude specific admin/staff emails from OTP verification
    const excludedEmails = ['admin@pusaka.com', 'editor@pusaka.com', 'publisher@pusaka.com', 'customer@pusaka.id']
    
    if (excludedEmails.includes(email)) {
      console.log('⚡ OTP verification skipped for admin/staff account:', email)
      // For excluded emails, skip OTP and return success
      return NextResponse.json({ 
        success: true, 
        message: 'OTP verification skipped for admin/staff accounts',
        skipOTP: true 
      })
    }

    console.log('🔍 Looking up user in database')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log('👤 User found:', !!existingUser)

    if (type === 'register') {
      // For register type, user should already exist (created by register API)
      if (!existingUser) {
        console.log('❌ User not found for registration verification')
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
      }
      console.log('📝 Registration OTP request - user exists')
      // No password verification needed for registration email verification
    }

    if (type === 'login') {
      if (!existingUser) {
        console.log('❌ User not found for login')
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
      }
      if (!password) {
        console.log('❌ Password missing for login')
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
      }
      
      console.log('🔐 Verifying password')
      // Verify password
      const isValidPassword = await bcrypt.compare(password, existingUser.password || '')
      console.log('✅ Password valid:', isValidPassword)
      if (!isValidPassword) {
        console.log('❌ Invalid password')
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
      }
    }

    // Generate OTP
    console.log('🎲 Generating OTP')
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    console.log('⏰ OTP expiry set to:', otpExpiry)

    if (type === 'register') {
      console.log('📝 Updating user with OTP for registration')
      // Update existing user with OTP (user was just created by register API)
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    } else {
      console.log('🔐 Updating user with OTP for login')
      // Update existing user with OTP for login
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    }

    console.log('📧 Sending OTP email')
    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, type)
    console.log('📤 Email send result:', emailResult)
    
    if (!emailResult.success) {
      console.log('❌ Failed to send OTP email')
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    console.log('✅ OTP sent successfully')
    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email}`,
      expiresAt: otpExpiry.toISOString()
    })

  } catch (error) {
    console.error('💥 Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

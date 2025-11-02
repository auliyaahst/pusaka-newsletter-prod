import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmailVerification, generateVerificationToken } from '@/lib/emailVerification'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with 3-month free trial (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscriptionType: 'FREE_TRIAL',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
        role: 'CUSTOMER',
        isActive: true,
        isVerified: false, // User needs to verify email
        otpCode: verificationToken, // Store verification token
        otpExpiry: tokenExpiry
      }
    })

    // Send verification email
    const emailResult = await sendEmailVerification(email, verificationToken)
    
    if (!emailResult.success) {
      // If email fails, still return success but with warning
      console.error('Failed to send verification email:', emailResult.error)
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.', 
        user: userWithoutPassword,
        emailSent: emailResult.success
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
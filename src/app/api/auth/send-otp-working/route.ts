import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock user for testing (in production this would be in database)
const mockUser = {
  id: '1',
  email: 'tpadmin@thepusaka.id',
  name: 'TP Super Admin',
  role: 'SUPER_ADMIN',
  // This will be updated when password is reset
  password: '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // New password from reset
}

export async function POST(request: NextRequest) {
  try {
    const { email, type, password } = await request.json()
    console.log('🚀 [WORKING] Send OTP API called - email:', email, 'type:', type)

    if (!email || !type) {
      console.log('❌ Missing email or type')
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 })
    }

    // Exclude specific admin/staff emails from OTP verification (same as original)
    const excludedEmails = ['admin@pusaka.com', 'editor@pusaka.com', 'publisher@pusaka.com', 'customer@pusaka.id']
    
    if (excludedEmails.includes(email)) {
      console.log('⚡ OTP verification skipped for admin/staff account:', email)
      return NextResponse.json({ 
        success: true, 
        message: 'OTP verification skipped for admin/staff accounts',
        skipOTP: true 
      })
    }

    console.log('🔍 [WORKING] Looking up user in mock database')
    const existingUser = mockUser.email.toLowerCase() === email.toLowerCase() ? mockUser : null
    console.log('👤 User found:', !!existingUser)

    if (type === 'login') {
      if (!existingUser) {
        console.log('❌ User not found for login')
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      if (!password) {
        console.log('❌ Password missing for login')
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }
      
      console.log('🔐 Verifying password')
      // Check against both old and new password for testing
      const oldPasswordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3w6ckVG/Sy' // admin123
      const newPasswordHash = '$2b$12$skyS8Ql7K/auejdksBF1eOh2W7WNaW1lx1BgXi2jutz2QXgcNqW4e' // new password from reset
      
      const isValidOldPassword = await bcrypt.compare(password, oldPasswordHash)
      const isValidNewPassword = await bcrypt.compare(password, newPasswordHash)
      
      console.log('🔍 Testing password against old hash:', isValidOldPassword)
      console.log('🔍 Testing password against new hash:', isValidNewPassword)
      console.log('🔍 Password being tested:', password)
      
      const isValidPassword = isValidOldPassword || isValidNewPassword
      
      console.log('✅ Password valid:', isValidPassword)
      if (!isValidPassword) {
        console.log('❌ Invalid password')
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      }
    }

    // For testing, always skip OTP for tpadmin@thepusaka.id
    if (email === 'tpadmin@thepusaka.id') {
      console.log('⚡ [WORKING] OTP verification skipped for test admin account')
      return NextResponse.json({ 
        success: true, 
        message: 'OTP verification skipped for test admin accounts',
        skipOTP: true 
      })
    }

    // Generate fake OTP for other emails
    console.log('🎲 Generating fake OTP')
    const otp = '123456' // Fixed OTP for testing
    console.log('⏰ [WORKING] Fake OTP generated:', otp)

    console.log('📧 [WORKING] Simulating OTP email send')
    
    console.log('✅ [WORKING] OTP sent successfully (simulated)')
    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email} (Test Mode: OTP is 123456)`,
      testOTP: '123456' // For testing only
    })

  } catch (error) {
    console.error('💥 [WORKING] Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

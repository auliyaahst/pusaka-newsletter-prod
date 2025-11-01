import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user: tpadmin@thepusaka.id')
    
    // Check if super admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'tpadmin@thepusaka.id' }
    })

    if (existingUser) {
      console.log('✅ Super admin user already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('👑 Role:', existingUser.role)
      console.log('🔐 Password: admin123 (if you need to reset it, delete the user and run this script again)')
      return existingUser
    }

    // Create super admin user with strong password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'TP Admin',
        email: 'tpadmin@thepusaka.id',
        password: hashedPassword,
        role: 'ADMIN', // Highest role with full access
        isActive: true,
        isVerified: true, // Pre-verified so no OTP needed
        subscriptionType: 'ANNUALLY', // Premium subscription
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years from now
        trialUsed: false, // Can still use trial features if needed
      }
    })

    console.log('✅ Super admin user created successfully!')
    console.log('📧 Email: tpadmin@thepusaka.id')
    console.log('🔐 Password: admin123')
    console.log('👑 Role: ADMIN (full access to all features)')
    console.log('🎯 Access: Dashboard, Articles, Users, Payments, Settings, etc.')
    console.log('📱 Status: Active & Pre-verified (no OTP needed)')
    console.log('💎 Subscription: Annual (10 years)')
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('   Email: tpadmin@thepusaka.id')
    console.log('   Password: admin123')
    console.log('')
    console.log('🌐 You can now login at: http://localhost:3000/login')
    
    return superAdmin
  } catch (error) {
    console.error('❌ Error creating super admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
createSuperAdmin()
  .then(() => {
    console.log('🎉 Super admin setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to create super admin:', error)
    process.exit(1)
  })

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
      console.log('🔐 Password: M@cchiato0# (if you need to reset it, delete the user and run this script again)')
      console.log('🎯 This user has ALL DASHBOARD ACCESS: Admin + Publisher + Editor + Customer dashboards')
      console.log('🌐 Access all dashboard features at: https://thepusaka.id/dashboard')
      return existingUser
    }

    // Create super admin user with strong password
    const hashedPassword = await bcrypt.hash('M@cchiato0#', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'TP Super Admin',
        email: 'tpadmin@thepusaka.id',
        password: hashedPassword,
        role: 'SUPER_ADMIN', // Highest role - grants access to ALL dashboards
        isActive: true,
        isVerified: true, // Pre-verified so no OTP needed
        subscriptionType: 'ANNUALLY', // Premium subscription
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years from now
        trialUsed: false, // Can still use trial features if needed
        // SUPER_ADMIN role grants access to ALL dashboards:
        // - ADMIN dashboard: System settings, analytics
        // - PUBLISHER dashboard: Edition publishing, content management  
        // - EDITOR dashboard: Article editing, review system
        // - CUSTOMER dashboard: All customer features
      }
    })

    console.log('✅ Super admin user created successfully!')
    console.log('📧 Email: tpadmin@thepusaka.id')
    console.log('🔐 Password: M@cchiato0#')
    console.log('👑 Role: SUPER_ADMIN (SUPER USER - ALL DASHBOARD ACCESS)')
    console.log('')
    console.log('🔑 Role Hierarchy & Access:')
    console.log('   � SUPER_ADMIN (YOU): Access to ALL dashboards below')
    console.log('   🔑 ADMIN: Admin dashboard only (user management, system settings)')
    console.log('   📝 PUBLISHER: Publisher dashboard only (edition publishing, newsletter management)')
    console.log('   ✏️  EDITOR: Editor dashboard only (article editing, review system)')
    console.log('   👤 CUSTOMER: Customer dashboard only (subscriber features)')
    console.log('')
    console.log('📱 Status: Active & Pre-verified (no OTP needed)')
    console.log('💎 Subscription: Annual (10 years)')
    console.log('')
    console.log('🚀 ALL Dashboard Features Available (SUPER_ADMIN Access):')
    console.log('   📊 Admin Dashboard: Analytics, Reports, System Settings')
    console.log('   👥 Admin Dashboard: User Management (Create/Edit/Delete users)')
    console.log('   � Publisher Dashboard: Edition Management (Create/Publish newsletters)')
    console.log('   📧 Publisher Dashboard: Email & Communication Tools')
    console.log('   ✏️  Editor Dashboard: Article Management (Create/Edit/Publish articles)')
    console.log('   ⭐ Editor Dashboard: Review System & Content Moderation')
    console.log('   💳 Admin Dashboard: Payment & Subscription Management')
    console.log('   � Customer Dashboard: All subscriber content access')
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('   Email: tpadmin@thepusaka.id')
    console.log('   Password: M@cchiato0#')
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

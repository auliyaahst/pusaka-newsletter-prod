import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSuperAdminDirectly() {
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
      
      // Update existing user to SUPER_ADMIN if they're currently ADMIN
      if (existingUser.role === 'ADMIN') {
        console.log('🔄 Upgrading existing ADMIN to SUPER_ADMIN...')
        const updatedUser = await prisma.user.update({
          where: { email: 'tpadmin@thepusaka.id' },
          data: { role: 'SUPER_ADMIN' }
        })
        console.log('✅ Successfully upgraded to SUPER_ADMIN role!')
        console.log('👑 New Role:', updatedUser.role)
      }
      
      console.log('🎯 This user has ALL DASHBOARD ACCESS: Admin + Publisher + Editor + Customer dashboards')
      console.log('🌐 Access all dashboard features at: https://thepusaka.id/dashboard')
      return existingUser
    }

    // Create super admin user with strong password
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.$executeRaw`
      INSERT INTO "User" (
        id,
        name,
        email,
        password,
        role,
        "isActive",
        "isVerified",
        "subscriptionType",
        "subscriptionStart",
        "subscriptionEnd",
        "trialUsed",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'TP Super Admin',
        'tpadmin@thepusaka.id',
        ${hashedPassword},
        'SUPER_ADMIN',
        true,
        true,
        'ANNUALLY',
        NOW(),
        NOW() + INTERVAL '10 years',
        false,
        NOW(),
        NOW()
      )
    `

    // Fetch the created user to display info
    const createdUser = await prisma.user.findUnique({
      where: { email: 'tpadmin@thepusaka.id' }
    })

    console.log('✅ Super admin user created successfully!')
    console.log('📧 Email: tpadmin@thepusaka.id')
    console.log('🔐 Password: admin123')
    console.log('👑 Role: SUPER_ADMIN (SUPER USER - ALL DASHBOARD ACCESS)')
    console.log('')
    console.log('🔑 Role Hierarchy & Access:')
    console.log('   🌟 SUPER_ADMIN (YOU): Access to ALL dashboards below')
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
    console.log('   📝 Publisher Dashboard: Edition Management (Create/Publish newsletters)')
    console.log('   📧 Publisher Dashboard: Email & Communication Tools')
    console.log('   ✏️  Editor Dashboard: Article Management (Create/Edit/Publish articles)')
    console.log('   ⭐ Editor Dashboard: Review System & Content Moderation')
    console.log('   💳 Admin Dashboard: Payment & Subscription Management')
    console.log('   📖 Customer Dashboard: All subscriber content access')
    console.log('')
    console.log('🔑 Login credentials:')
    console.log('   Email: tpadmin@thepusaka.id')
    console.log('   Password: admin123')
    console.log('')
    console.log('🌐 You can now login at: https://thepusaka.id/login')
    
    return createdUser
  } catch (error) {
    console.error('❌ Error creating super admin user:', error)
    
    // If the SUPER_ADMIN enum doesn't exist yet, create as ADMIN and upgrade later
    if (error.message?.includes('invalid input value for enum') || error.message?.includes('SUPER_ADMIN')) {
      console.log('⚠️  SUPER_ADMIN role not found in database. Creating as ADMIN for now...')
      
      try {
        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
          where: { email: 'tpadmin@thepusaka.id' }
        })

        if (existingUser) {
          console.log('✅ User already exists with role:', existingUser.role)
          return existingUser
        }

        // Create with ADMIN role as fallback
        const hashedPassword = await bcrypt.hash('admin123', 12)
        const superAdmin = await prisma.user.create({
          data: {
            name: 'TP Super Admin',
            email: 'tpadmin@thepusaka.id',
            password: hashedPassword,
            role: 'ADMIN', // Fallback to ADMIN role
            isActive: true,
            isVerified: true,
            subscriptionType: 'ANNUALLY',
            subscriptionStart: new Date(),
            subscriptionEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            trialUsed: false,
          }
        })

        console.log('✅ Super admin user created with ADMIN role!')
        console.log('📧 Email: tpadmin@thepusaka.id')
        console.log('🔐 Password: admin123')
        console.log('👑 Role: ADMIN (will be upgraded to SUPER_ADMIN after database migration)')
        console.log('🌐 You can now login at: https://thepusaka.id/login')
        
        return superAdmin
      } catch (fallbackError) {
        console.error('❌ Fallback creation also failed:', fallbackError)
        throw fallbackError
      }
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
createSuperAdminDirectly()
  .then(() => {
    console.log('🎉 Super admin setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to create super admin:', error)
    process.exit(1)
  })

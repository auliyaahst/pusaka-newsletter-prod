import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSuperAdminEnum() {
  try {
    console.log('🔧 Adding SUPER_ADMIN to UserRole enum...')
    
    // Add SUPER_ADMIN to the UserRole enum
    await prisma.$executeRaw`
      ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    `
    
    console.log('✅ Successfully added SUPER_ADMIN to UserRole enum!')
    console.log('🎯 You can now create users with SUPER_ADMIN role')
    
  } catch (error) {
    console.error('❌ Error adding SUPER_ADMIN enum:', error)
    console.log('ℹ️  This might be normal if SUPER_ADMIN already exists')
  } finally {
    await prisma.$disconnect()
  }
}

addSuperAdminEnum()
  .then(() => {
    console.log('🎉 Enum update complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to update enum:', error)
    process.exit(1)
  })

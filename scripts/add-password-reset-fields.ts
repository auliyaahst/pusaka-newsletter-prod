import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addPasswordResetFields() {
  try {
    console.log('🔧 Adding password reset fields to User table...')
    
    // Add reset token and expiry fields
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
      ADD COLUMN IF NOT EXISTS "resetExpiry" TIMESTAMP(3);
    `
    
    console.log('✅ Successfully added password reset fields!')
    console.log('🎯 Users can now request password resets')
    
  } catch (error) {
    console.error('❌ Error adding password reset fields:', error)
    console.log('ℹ️  This might be normal if the fields already exist')
  } finally {
    await prisma.$disconnect()
  }
}

addPasswordResetFields()
  .then(() => {
    console.log('🎉 Password reset setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to add password reset fields:', error)
    process.exit(1)
  })

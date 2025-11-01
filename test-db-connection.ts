import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('📋 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    // Simple connection test
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log('👥 Total users in database:', userCount)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

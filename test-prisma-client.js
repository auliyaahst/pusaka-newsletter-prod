const { PrismaClient } = require('@prisma/client')

async function testPrismaClient() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing Prisma Client connection...')
    
    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Query successful! Found ${userCount} users in the database.`)
    
    // Try to fetch some users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    console.log('✅ User fetch successful!')
    console.log('Sample users:', users)
    
  } catch (error) {
    console.error('❌ Prisma Client Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
    console.log('Database connection closed.')
  }
}

testPrismaClient()

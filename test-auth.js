const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('🔍 Testing authentication setup...')
    
    // Check if we can connect to database
    const userCount = await prisma.user.count()
    console.log(`👥 Total users in database: ${userCount}`)
    
    // Check if there are any active verified users
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        password: true
      }
    })
    
    console.log(`✅ Active & verified users: ${activeUsers.length}`)
    
    activeUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
      console.log(`     Has password: ${!!user.password}`)
    })
    
    // Check for any users with Google OAuth accounts
    const googleUsers = await prisma.account.findMany({
      where: {
        provider: 'google'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isActive: true,
            isVerified: true
          }
        }
      }
    })
    
    console.log(`🔑 Google OAuth users: ${googleUsers.length}`)
    googleUsers.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.user.name} (${account.user.email})`)
    })
    
  } catch (error) {
    console.error('❌ Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()

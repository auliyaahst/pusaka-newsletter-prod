import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const { id: articleId } = await params

    console.log('📦 [WORKING] Archived article:', {
      articleId,
      archivedBy: session.user.email
    })

    // For mock implementation, just return success
    return NextResponse.json({
      message: 'Article archived successfully',
      article: {
        id: articleId,
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Error archiving article:', error)
    return NextResponse.json(
      { error: 'Failed to archive article' },
      { status: 500 }
    )
  }
}

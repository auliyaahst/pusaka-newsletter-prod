import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Import the shared mock data (this should ideally be in a shared module)
// For now, we'll create a simple implementation

export async function PATCH(
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

    const { status } = await request.json()
    const { id: articleId } = await params

    // Validate status
    const validStatuses = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    console.log('📝 [WORKING] Updated article status:', {
      articleId,
      newStatus: status,
      updatedBy: session.user.email
    })

    // For mock implementation, just return success
    return NextResponse.json({
      message: 'Article status updated successfully',
      article: {
        id: articleId,
        status: status,
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Error updating article status:', error)
    return NextResponse.json(
      { error: 'Failed to update article status' },
      { status: 500 }
    )
  }
}

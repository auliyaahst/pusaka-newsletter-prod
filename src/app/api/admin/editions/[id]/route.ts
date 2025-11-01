import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can update editions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isPublished } = body

    const edition = await prisma.edition.update({
      where: { id: resolvedParams.id },
      data: {
        isPublished: isPublished,
        updatedAt: new Date(),
      },
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Edition updated successfully',
      edition
    })
  } catch (error) {
    console.error('Error in editions:', error)
    return NextResponse.json(
      { error: 'Failed to update edition' },
      { status: 500 }
    )
  }
}
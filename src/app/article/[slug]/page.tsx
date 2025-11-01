'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  content: string
  contentType: string
  excerpt: string
  slug: string
  publishedAt: string
  readTime: number
  featured: boolean
  edition: {
    id: string
    title: string
    publishDate: string
    editionNumber: number
  }
}

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  articles: Article[]
  _count: {
    articles: number
  }
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchEditions()
      if (params.slug) {
        fetchArticle(params.slug as string)
      }
    }
  }, [status, params.slug, router])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Close profile menu if clicked outside
      if (isMenuOpen && !target.closest('[data-dropdown="profile"]')) {
        setIsMenuOpen(false)
      }
      
      // Close edition menu if clicked outside
      if (isEditionMenuOpen && !target.closest('[data-dropdown="edition"]')) {
        setIsEditionMenuOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsEditionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isMenuOpen, isEditionMenuOpen])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions)
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    }
  }

  const fetchArticle = async (slug: string) => {
    try {
      const response = await fetch(`/api/articles/${slug}`)
      if (!response.ok) {
        throw new Error('Article not found')
      }
      const data = await response.json()
      setArticle(data.article)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The article you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            style={{backgroundColor: 'var(--accent-blue)'}}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Floating Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed left-6 top-24 z-40 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{backgroundColor: 'var(--accent-blue)'}}
        title="Back to Dashboard"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Header with Hamburger Menu */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/logo_title.svg" 
                alt="The Pusaka Newsletter Logo" 
                width={150}
                height={64}
                className="h-16 w-auto"
                style={{
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </button>
            
            {/* Hamburger Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50" data-dropdown="profile">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-600 truncate">{session?.user?.email}</p>
                        {session?.user?.role && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {session.user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {/* Profile Item */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </button>

                    {/* Dashboard Items */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/admin')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    
                    {(session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/editorial')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editorial Dashboard</span>
                      </button>
                    )}
                    
                    {(session?.user?.role === 'PUBLISHER' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/publisher')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-13-3v9a2 2 0 002 2h9a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                        </svg>
                        <span>Publisher Dashboard</span>
                      </button>
                    )}

                    {/* Edition Selection */}
                    {editions.length > 0 && (
                      <div className="border-t border-gray-200 mt-2 pt-2" data-dropdown="edition">
                        <div className="relative">
                          <button
                            onClick={() => setIsEditionMenuOpen(!isEditionMenuOpen)}
                            className="w-full flex items-center justify-between text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                          >
                            <div className="px-0 py-0">
                              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Edition</p>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isEditionMenuOpen ? 'rotate-180' : ''}`} 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Edition Submenu */}
                          {isEditionMenuOpen && (
                            <div className="bg-gray-50 max-h-[300px] overflow-y-auto">
                              {editions.map((edition) => (
                                <button
                                  key={edition.id}
                                  onClick={() => {
                                    // Navigate to dashboard and scroll to this edition
                                    router.push(`/dashboard?edition=${edition.id}`)
                                    setIsMenuOpen(false)
                                    setIsEditionMenuOpen(false)
                                  }}
                                  className={`w-full px-8 py-3 text-left hover:bg-gray-100 transition-colors duration-150 text-sm ${
                                    article.edition.id === edition.id 
                                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                                      : 'text-gray-700'
                                  }`}
                                  type="button"
                                >
                                  <div className="truncate font-medium">{edition.title}</div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span>
                                      {new Date(edition.publishDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span>{edition._count?.articles || 0} articles</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/login' })
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 font-peter">
        {/* Article Header */}
        <div className="mb-8">
          {/* Edition Info */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              {article.edition.title} • Edition {article.edition.editionNumber} • {' '}
              {new Date(article.edition.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{color: 'var(--accent-blue)'}}>
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
            {article.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            <span>{article.readTime} min read</span>
            <span>
              Published {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-lg text-gray-800 leading-relaxed italic">
                {article.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.contentType === 'HTML' ? (
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="article-content"
            />
          ) : (
            <div className="whitespace-pre-wrap">
              {article.content}
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        {/* <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            style={{backgroundColor: 'var(--accent-blue)'}}
          >
            ← Back to Newsletter
          </button>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="text-white py-4 px-8 mt-16" style={{backgroundColor: 'var(--accent-blue)'}}>
        <p className="text-center text-sm max-w-4xl mx-auto">© The Pusaka Newsletter</p>
      </footer>
    </div>
  )
}

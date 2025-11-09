'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  excerpt: string
  slug: string
  featured: boolean
  readTime: number
  publishedAt: string
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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false)
  const [loginTime, setLoginTime] = useState<number | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchEditions()
    }
  }, [status, router])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions)
      } else {
        console.error('Failed to fetch editions')
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArticleClick = (slug: string) => {
    router.push(`/article/${slug}`)
  }

  const filteredEditions = editions.map(edition => ({
    ...edition,
    articles: edition.articles.filter(article =>
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(edition => 
    searchQuery === '' || 
    edition.articles.length > 0 ||
    edition.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Set login time when session starts
  useEffect(() => {
    if (session && status === 'authenticated' && !loginTime) {
      const now = Date.now()
      setLoginTime(now)
      console.log('Login time set:', new Date(now).toLocaleTimeString())
    }
  }, [session, status, loginTime])

  // Check session expiration based on login time - COMMENTED OUT 15-minute timeout for CRUD operations
  // useEffect(() => {
  //   if (loginTime && session && status === 'authenticated') {
  //     const checkSessionTimeout = () => {
  //       const now = Date.now()
  //       const sessionDuration = now - loginTime
  //       const timeoutDuration = 15 * 60 * 1000 // 15 minutes in milliseconds

  //       console.log(`Session check: ${sessionDuration / 1000}s elapsed, timeout at ${timeoutDuration / 1000}s`)
        
  //       if (sessionDuration > timeoutDuration) {
  //         console.log('Session expired after', sessionDuration / 1000, 'seconds')
  //         setShowSessionExpiredModal(true)
  //         return
  //       }
        
  //       // Also check with NextAuth
  //       fetch('/api/auth/session', { cache: 'no-store' })
  //         .then(res => res.json())
  //         .then(data => {
  //           if (!data?.user) {
  //             console.log('NextAuth session expired')
  //             setShowSessionExpiredModal(true)
  //           }
  //         })
  //         .catch(error => {
  //           console.error('Session check failed:', error)
  //           setShowSessionExpiredModal(true)
  //         })
  //     }

  //     // Check immediately
  //     checkSessionTimeout()
      
  //     // Set up interval to check every 5 seconds for testing
  //     const interval = setInterval(checkSessionTimeout, 5000)

  //     return () => clearInterval(interval)
  //   }
  // }, [loginTime, session, status])

  const handleSessionExpiredLogin = async () => {
    setShowSessionExpiredModal(false)
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with exact blue color from image */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Logo from logo_title.svg */}
              <div className="h-12 flex items-center">
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
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Navigation menu icon with dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white hover:text-blue-200 p-1"
                >
                  <svg className="w-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-600">{session.user?.email}</p>
                    </div>
                    <div className="p-4">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full font-peter" style={{backgroundColor: 'var(--accent-cream)'}}>
        {/* Edition Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-gray-800 text-sm font-medium">First Edition, Jul 25</p>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Article Keywords.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 md:w-64 lg:w-72 px-4 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white font-peter"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Content */}
        <div className="px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading newsletter content...</p>
              </div>
            )}
            {!loading && filteredEditions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No newsletter content available.</p>
              </div>
            )}
            {!loading && filteredEditions.length > 0 && (
              <>
                {filteredEditions.map((edition) => (
                <div key={edition.id} className="mb-12">
                  {/* Main Headline */}
                  <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                      {edition.title.split(' ').slice(0, -1).join(' ')}
                    </h1>
                    <h2 className="text-3xl font-bold text-black">
                      {edition.title.split(' ').slice(-1)[0]}
                    </h2>
                    {edition.description && (
                      <p className="text-lg text-gray-600 mt-4">{edition.description}</p>
                    )}
                  </div>

                  {/* Edition Contents */}
                  <div className="">
                    <h3 className="text-xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                      Edition Contents ({edition._count.articles} articles)
                    </h3>
                    <div className="space-y-6">
                      {edition.articles.map((article) => (
                        <div key={article.id} className="border-b border-gray-400 pb-4">
                          <button
                            onClick={() => handleArticleClick(article.slug)}
                            className="text-left w-full group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-xl mb-2 underline group-hover:text-blue-700 transition-colors" 
                                    style={{color: 'var(--accent-blue)'}}>
                                  {article.title}
                                  {article.featured && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                      Featured
                                    </span>
                                  )}
                                </h4>
                                <p className="text-black text-xl leading-relaxed">
                                  {article.excerpt}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>{article.readTime} min read</span>
                                  <span>
                                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              </>
            )}

            {/* EV Illustration - simplified line art matching the image */}
            <div className="flex justify-center items-end space-x-12 my-12">
              {/* Car illustration */}
              <div className="flex items-center justify-center">
                <svg className="w-32 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 120 60" strokeWidth="2">
                  <path d="M15 45 L20 25 L30 25 L35 20 L85 20 L90 25 L100 25 L105 45 L100 45 L100 50 L95 50 L95 45 L25 45 L25 50 L20 50 L20 45 Z"/>
                  <circle cx="30" cy="45" r="5" fill="none"/>
                  <circle cx="90" cy="45" r="5" fill="none"/>
                  <path d="M35 25 L85 25"/>
                  <path d="M45 25 L45 35"/>
                  <path d="M75 25 L75 35"/>
                </svg>
              </div>
              
              {/* Charging station */}
              <div className="flex items-center justify-center">
                <svg className="w-16 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 50 80" strokeWidth="2">
                  <rect x="20" y="10" width="10" height="60" rx="3"/>
                  <path d="M25 20 L25 30"/>
                  <circle cx="25" cy="35" r="3" fill="currentColor"/>
                  <path d="M25 40 L25 50"/>
                  <rect x="5" y="60" width="40" height="8" rx="2"/>
                  <path d="M15 60 L35 60"/>
                </svg>
              </div>
              
              {/* Battery */}
              <div className="flex items-center justify-center">
                <svg className="w-24 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 80 50" strokeWidth="2">
                  <rect x="10" y="15" width="55" height="20" rx="3"/>
                  <rect x="65" y="20" width="8" height="10" rx="2"/>
                  <path d="M18 25 L28 25"/>
                  <path d="M35 25 L45 25"/>
                  <path d="M52 25 L57 25"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-white py-4 px-8" style={{backgroundColor: 'var(--accent-blue)'}}>
          <p className="text-center text-sm">© The Pusaka Newsletter</p>
        </footer>
      </main>

      {/* Session Expired Modal */}
      {showSessionExpiredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Session Expired
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your session has expired for security reasons. Please log in again to continue using the dashboard.
              </p>
              <button
                onClick={handleSessionExpiredLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                style={{backgroundColor: 'var(--accent-blue)'}}
              >
                Login Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

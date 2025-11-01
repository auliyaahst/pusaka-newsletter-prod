'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
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
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false)
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false)
  const [loginTime, setLoginTime] = useState<number | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFloatingSearch, setShowFloatingSearch] = useState(false)
  const [showFloatingIcon, setShowFloatingIcon] = useState(false)
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)

  // Helper function to get edition label (unused - keeping for potential future use)
  // const getEditionLabel = (editionNumber: number | null): string => {
  //   if (editionNumber === 1) return 'First Edition'
  //   if (editionNumber === 2) return 'Second Edition'
  //   if (editionNumber) return `#${editionNumber}`
  //   return ''
  // }

  // Helper function to get edition display text
  const getEditionDisplayText = (edition: Edition): string => {
    if (!edition.publishDate) return 'Newsletter Edition'
    
    let editionLabel: string
    if (edition.editionNumber === 1) {
      editionLabel = 'First Edition'
    } else if (edition.editionNumber === 2) {
      editionLabel = 'Second Edition'
    } else if (edition.editionNumber === 3) {
      editionLabel = 'Third Edition'
    } else if (edition.editionNumber === 4) {
      editionLabel = 'Fourth Edition'
    } else if (edition.editionNumber === 5) {
      editionLabel = 'Fifth Edition'
    } else if (edition.editionNumber) {
      // For numbers 6 and above, use ordinal numbers (6th, 7th, 8th, etc.)
      const getOrdinal = (num: number): string => {
        const suffix = ['th', 'st', 'nd', 'rd'][((num % 100) - 20) % 10] || 
                      ['th', 'st', 'nd', 'rd'][num % 100] || 
                      'th'
        return `${num}${suffix}`
      }
      editionLabel = `${getOrdinal(edition.editionNumber)} Edition`
    } else {
      editionLabel = 'Edition'
    }
    
    const dateString = new Date(edition.publishDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    return `${editionLabel}, ${dateString}`
  }

  // Helper function to extract summary from article content
  const getArticleSummary = (article: Article): string => {
    if (article.excerpt && article.excerpt.trim()) {
      return article.excerpt
    }
    
    if (!article.content) return ''
    
    // Extract text from HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = article.content
    
    // Look for Executive Summary section
    const strongTags = tempDiv.querySelectorAll('strong')
    for (const strong of strongTags) {
      if (strong.textContent?.toLowerCase().includes('executive summary')) {
        // Get the content after Executive Summary
        let summaryContent = ''
        let nextElement = strong.parentElement?.nextElementSibling
        const bulletPoints = []
        
        while (nextElement && bulletPoints.length < 4) {
          if (nextElement.tagName === 'UL') {
            const listItems = nextElement.querySelectorAll('li')
            for (const li of listItems) {
              const text = li.textContent?.trim()
              if (text && bulletPoints.length < 4) {
                bulletPoints.push(text)
              }
            }
            break
          } else if (nextElement.tagName === 'P' && nextElement.textContent?.trim()) {
            summaryContent = nextElement.textContent.trim()
            break
          }
          nextElement = nextElement.nextElementSibling
        }
        
        if (bulletPoints.length > 0) {
          return bulletPoints.join(' • ')
        }
        if (summaryContent) {
          return summaryContent
        }
      }
    }
    
    // Fallback: get first meaningful paragraph
    const paragraphs = tempDiv.querySelectorAll('p')
    for (const p of paragraphs) {
      const text = p.textContent?.trim()
      if (text && text.length > 50) {
        return text.length > 200 ? text.substring(0, 200) + '...' : text
      }
    }
    
    return ''
  }

   // Add fetchEditions to dependencies

  const fetchEditions = useCallback(async () => {
    try {
      console.log('Fetching editions from API...')
      const response = await fetch('/api/editions', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        console.log('Number of editions received:', data.editions.length)
        data.editions.forEach((edition: Edition, index: number) => {
          console.log(`Edition ${index + 1}:`, edition.id, edition.title, edition.editionNumber)
        })
        setEditions(data.editions)
        // Set the first (latest) edition as default if no edition is selected
        if (data.editions.length > 0 && !selectedEditionId) {
          console.log('Setting default edition to:', data.editions[0].id, data.editions[0].title)
          setSelectedEditionId(data.editions[0].id)
        }
      } else {
        console.error('Failed to fetch editions, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedEditionId])
  useEffect(() => {
    console.log('🔐 Dashboard auth check - status:', status, 'session:', !!session)
    if (status === 'loading') {
      console.log('⏳ Auth status is loading...')
      return
    }
    
    if (status === 'unauthenticated') {
      console.log('❌ User is unauthenticated, redirecting to login')
      router.push('/login')
    } else if (status === 'authenticated') {
      console.log('✅ User is authenticated, fetching editions')
      console.log('👤 Session user:', session?.user?.email, session?.user?.role)
      fetchEditions()
    }
  }, [status, router, fetchEditions])
  // Auto-select first edition when editions are loaded
  useEffect(() => {
    console.log('useEffect triggered - editions:', editions.length, 'selectedEditionId:', selectedEditionId)
    if (editions.length > 0 && !selectedEditionId) {
      console.log('Auto-selecting first edition:', editions[0].id, editions[0].title)
      setSelectedEditionId(editions[0].id)
    }
  }, [editions, selectedEditionId])

  // Debug selectedEditionId changes
  useEffect(() => {
    console.log('selectedEditionId changed to:', selectedEditionId)
    if (selectedEditionId && editions.length > 0) {
      const selectedEdition = editions.find(e => e.id === selectedEditionId)
      console.log('Selected edition details:', selectedEdition?.title, 'Articles:', selectedEdition?.articles?.length)
    }
  }, [selectedEditionId, editions])

  const handleArticleClick = (slug: string) => {
    router.push(`/article/${slug}`)
  }

  // Fix the edition selection handler
  const handleEditionSelect = (editionId: string) => {
    console.log('🔥 handleEditionSelect START - editionId:', editionId)
    console.log('🔥 Previous selectedEditionId:', selectedEditionId)
    
    const targetEdition = editions.find(e => e.id === editionId)
    console.log('🔥 Target edition found:', targetEdition?.title, targetEdition?.id)
    
    if (!targetEdition) {
      console.error('🔥 Edition not found for ID:', editionId)
      return
    }
    
    console.log('🔥 Setting selectedEditionId to:', editionId)
    setSelectedEditionId(editionId)
    setIsEditionMenuOpen(false)
    setIsMenuOpen(false)
    // REMOVED: setSearchQuery('') // Keep search query when switching editions
    
    console.log('🔥 handleEditionSelect END - should now be:', editionId)
    
    // Force content area to scroll to top
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.scrollTop = 0
    }
  }

  // Get the currently selected edition - MOVED UP
  const selectedEdition = editions.find(edition => edition.id === selectedEditionId) || null

  // Add debugging to track state changes
  useEffect(() => {
    console.log('Edition state changed:', {
      selectedEditionId,
      selectedEdition: selectedEdition?.title,
      articleCount: selectedEdition?.articles?.length
    })
  }, [selectedEditionId, selectedEdition])

  // Ensure the edition text updates properly
  // const getCurrentEditionText = (): string => {
  //   if (!selectedEditionId || editions.length === 0) {
  //     return 'Newsletter Edition'
  //   }
    
  //   const edition = editions.find(e => e.id === selectedEditionId)
  //   if (!edition) {
  //     console.warn('Selected edition not found:', selectedEditionId)
  //     return 'Newsletter Edition'
  //   }
    
  //   return getEditionDisplayText(edition)
  // }
  
  // // Add error boundary for debugging
  // const debugSelectedEdition = () => {
  //   console.log('Debug - Current state:', {
  //     selectedEditionId,
  //     editionsCount: editions.length,
  //     selectedEdition: selectedEdition?.title,
  //     articlesCount: filteredArticles.length
  //   })
  // }

  // Debugging: Log the selectedEdition object and its articles
  console.log('selectedEdition object:', selectedEdition)
  console.log('selectedEdition.articles:', selectedEdition?.articles)

  // Set login time when session starts
  useEffect(() => {
    if (session && status === 'authenticated' && !loginTime) {
      const now = Date.now()
      setLoginTime(now)
      console.log('Login time set:', new Date(now).toLocaleTimeString())
    }
  }, [session, status, loginTime])

  // Filter articles from the selected edition based on search
  const filteredArticles = selectedEdition 
    ? selectedEdition.articles.filter(article =>
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getArticleSummary(article).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  // Add a helper to show which edition is being searched
  const getSearchResultsText = (): string => {
    if (!searchQuery) return ''
    if (!selectedEdition) return ''
    
    const totalArticles = selectedEdition.articles.length
    const foundArticles = filteredArticles.length
    
    return `Found ${foundArticles} of ${totalArticles} articles in "${selectedEdition.title}"`
  }

  // Check session expiration based on login time
  useEffect(() => {
    if (loginTime && session && status === 'authenticated') {
      const checkSessionTimeout = () => {
        const now = Date.now()
        const sessionDuration = now - loginTime
        const timeoutDuration = 15 * 60 * 1000 // 15 minutes in milliseconds

        console.log(`Session check: ${sessionDuration / 1000}s elapsed, timeout at ${timeoutDuration / 1000}s`)
        
        if (sessionDuration > timeoutDuration) {
          console.log('Session expired after', sessionDuration / 1000, 'seconds')
          setShowSessionExpiredModal(true)
          return
        }
        
        // Also check with NextAuth
        fetch('/api/auth/session', { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (!data?.user) {
              console.log('NextAuth session expired')
              setShowSessionExpiredModal(true)
            }
          })
          .catch(error => {
            console.error('Session check failed:', error)
            setShowSessionExpiredModal(true)
          })
      }

      // Check immediately
      checkSessionTimeout()
      
      // Set up interval to check every 5 seconds for testing
      const interval = setInterval(checkSessionTimeout, 5000)

      return () => clearInterval(interval)
    }
  }, [loginTime, session, status])

  // Scroll detection for floating search icon visibility
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement
      if (target && target.classList.contains('content-area')) {
        const scrollTop = target.scrollTop
        // Show floating icon when scrolled past the edition header (approximately 150px)
        // This should be when the edition header with search bar is no longer visible
        const shouldShow = scrollTop > 150
        setShowFloatingIcon(shouldShow)
      }
    }

    // Get the content area element
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      // Initial check
      const initialScrollTop = contentArea.scrollTop
      setShowFloatingIcon(initialScrollTop > 150)
      
      contentArea.addEventListener('scroll', handleScroll, { passive: true })
      return () => contentArea.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

  const handleSessionExpiredLogin = async () => {
    setShowSessionExpiredModal(false)
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    console.log('⏳ Dashboard: Auth status is loading, showing spinner')
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
    console.log('❌ Dashboard: No session found, redirecting to login')
    // Redirect to login if no session
    router.push('/login')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  console.log('✅ Dashboard: Rendering main dashboard for user:', session.user?.email)

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with exact blue color from image - Fixed at top */}
      <header 
        className="flex-shrink-0 text-white shadow-md" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
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
            
            <div className="flex items-center space-x-4">
              {/* Consolidated Profile Dropdown with Hamburger Menu */}
              <div className="relative" data-dropdown="profile">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
                >
                  {/* Hamburger Menu Icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Consolidated Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto transform origin-top-right animate-in fade-in scale-in-95 duration-200">
                    {/* Profile Section */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                          {session.user?.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {session.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile Item */}
                      <button
                        onClick={() => {
                          // Add profile navigation here if needed
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
                      {session.user?.role === 'ADMIN' && (
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
                      {session.user?.role === 'EDITOR' && (
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
                      {session.user?.role === 'PUBLISHER' && (
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
                          {/* <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Edition</p>
                          </div> */}
                          <div className="relative">
                            <button
                              onClick={() => setIsEditionMenuOpen(!isEditionMenuOpen)}
                              className="w-full flex items-center justify-between text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                            >
                              <div className="px-4 py-2">
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
                                      console.log('🔥 EDITION CLICKED:', edition.title, edition.id)
                                      handleEditionSelect(edition.id)
                                    }}
                                    className={`w-full px-8 py-3 text-left hover:bg-gray-100 transition-colors duration-150 text-sm ${
                                      selectedEditionId === edition.id 
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

                      {/* Sign Out */}
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden w-full font-peter flex flex-col" style={{backgroundColor: 'var(--accent-cream)'}}>
        
        {/* Content Area - Scrollable content */}
        <div className="flex-1 overflow-y-auto content-area">
          {/* Edition Header - Made non-sticky */}
          <div className="px-4 sm:px-6 lg:px-8 py-4" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-gray-800 text-sm font-medium">
                {selectedEditionId && editions.length > 0
                  ? (() => {
                      const selectedEdition = editions.find(e => e.id === selectedEditionId)
                      return selectedEdition ? getEditionDisplayText(selectedEdition) : 'Newsletter Edition'
                    })()
                  : 'Newsletter Edition'
                }
              </p>
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Article Keywords.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 md:w-64 lg:w-72 pl-10 pr-4 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white font-peter"
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
        </div>        {/* Newsletter Content */}
        <div className="px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading newsletter content...</p>
              </div>
            ) : (
              <>
                {(() => {
                  console.log('Rendering content - selectedEditionId:', selectedEditionId)
                  console.log('selectedEdition:', selectedEdition?.title)
                  console.log('filteredArticles length:', filteredArticles.length)
                  return null
                })()}
                {!selectedEdition ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Please select an edition from the menu above to view content.</p>
                  </div>
                ) : filteredArticles.length === 0 && searchQuery !== '' ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No articles found for &quot;{searchQuery}&quot; in &quot;{selectedEdition.title}&quot;.</p>  
                    <p className="text-gray-500 text-sm mt-2">Try searching in a different edition or use different keywords.</p>
                  </div>
                ) : (
                  <div className="mb-12" key={`edition-${selectedEditionId}`}>
                    {/* Show search results info */}
                    {searchQuery && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm">{getSearchResultsText()}</p>
                      </div>
                    )}
                    
                    {/* Main Headline - Dynamic based on edition */}
                    <div className="mb-8">
                      {selectedEdition.title === 'SHIFTING TO ELECTRIC VEHICLE' ? (
                        <>
                          <h1 className="text-5xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                            SHIFTING TO
                          </h1>
                          <h2 className="text-3xl font-bold text-black">
                            ELECTRIC VEHICLE
                          </h2>
                        </>
                      ) : (
                        <>
                          <h1 className="text-5xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                            {selectedEdition.title}
                          </h1>
                        </>
                      )}
                    </div>

                    {/* Edition Contents */}
                    <div className="">
                      <h3 className="text-xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                        Edition Contents
                      </h3>
                      {filteredArticles.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600 text-lg">This edition doesn&apos;t have any articles yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {filteredArticles.map((article) => (
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
                                      {getArticleSummary(article)}
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
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* EV Illustration - simplified line art matching the image */}
            {/* <div className="flex justify-center items-end space-x-12 my-12">
            </div> */}
          </div>
        </div>
        
        {/* Cover Image Section - Above Footer */}
        {/* {selectedEdition && selectedEdition.coverImage && (
          <div className="px-8 pb-8">
            <div className="max-w-4xl mx-auto">
              {(() => {
                try {
                  // Try to parse as JSON array first
                  const images = JSON.parse(selectedEdition.coverImage)
                  if (Array.isArray(images) && images.length > 0) {
                    // If multiple images, show them in a grid
                    if (images.length === 1) {
                      return (
                        <div className="flex justify-center">
                          <img
                            src={images[0]}
                            alt={`${selectedEdition.title} cover`}
                            className="max-w-md w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                          {images.map((image, index) => (
                            <div key={index} className="flex justify-center">
                              <img
                                src={image}
                                alt={`${selectedEdition.title} cover ${index + 1}`}
                                className="max-w-xs w-full h-auto object-contain rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      )
                    }
                  }
                  // If not an array, treat as single image URL
                  return (
                    <div className="flex justify-center">
                      <img
                        src={selectedEdition.coverImage}
                        alt={`${selectedEdition.title} cover`}
                        className="max-w-md w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  )
                } catch {
                  // If JSON parse fails, treat as single image URL
                  return (
                    <div className="flex justify-center">
                      <img
                        src={selectedEdition.coverImage}
                        alt={`${selectedEdition.title} cover`}
                        className="max-w-md w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  )
                }
              })()}
            </div>
          </div>
        )} */}
      </div>

      {/* Footer - Fixed at bottom, always visible */}
      <footer 
        className="flex-shrink-0 text-white py-4 px-8 shadow-md border-t border-opacity-20 border-gray-300" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
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

    {/* Floating Search Icon - Only visible when scrolled down */}
    {showFloatingIcon && (
      <button
        onClick={() => setShowFloatingSearch(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transform transition-all duration-500 ease-in-out hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
        style={{backgroundColor: 'var(--accent-blue)'}}
        aria-label="Search articles"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    )}

    {/* Floating Search Modal */}
    {showFloatingSearch && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Search Articles</h3>
              <button
                onClick={() => setShowFloatingSearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Article Keywords.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white font-peter"
                autoFocus
              />
              <div className="absolute right-3 top-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {searchQuery && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {filteredArticles.length} articles found
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowFloatingSearch(false)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowFloatingSearch(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => setShowFloatingSearch(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                style={{backgroundColor: 'var(--accent-blue)'}}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

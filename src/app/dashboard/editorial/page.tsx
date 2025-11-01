'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import EditorialEditionManagement from '@/components/editorial/EditorialEditionManagement'
import ArticleManagement from '@/components/editorial/ArticleManagement'
import ContentReview from '@/components/editorial/ContentReview'
import EditorialStatistics from '@/components/editorial/EditorialStatistics'

export default function EditorialDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('editions')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'EDITOR' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (session?.user?.role !== 'EDITOR' && session?.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'editions', label: 'Edition Management', icon: '�' },
    { id: 'articles', label: 'Article Management', icon: '📝' },
    { id: 'review', label: 'Content Review', icon: '👁️' },
    { id: 'statistics', label: 'Editorial Stats', icon: '📊' }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Header with Hamburger Menu - matching main dashboard style */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/logo_title.svg" 
                alt="The Pusaka Newsletter Logo" 
                width={120}
                height={48}
                className="h-12 sm:h-16 w-auto"
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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

                    {/* Back to Main Dashboard */}
                    <button
                      onClick={() => {
                        router.push('/dashboard')
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Main Dashboard</span>
                    </button>

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

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--accent-blue)'}}>Editorial Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeTab === tab.id ? { borderColor: 'var(--accent-blue)' } : {}}
              >
                <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="min-h-[calc(100vh-300px)]">
          {activeTab === 'editions' && <EditorialEditionManagement />}
          {activeTab === 'articles' && <ArticleManagement />}
          {activeTab === 'review' && <ContentReview />}
          {activeTab === 'statistics' && <EditorialStatistics />}
        </div>
      </main>
    </div>
  )
}
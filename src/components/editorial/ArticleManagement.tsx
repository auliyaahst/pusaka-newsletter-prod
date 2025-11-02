'use client'

import { useState, useEffect } from 'react'
import AddArticle from './AddArticle'
import EditArticle from './EditArticle'

type ArticleStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: ArticleStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  featured: boolean
  readTime: number
  metaTitle: string
  metaDescription: string
  contentType: string
  editionId: string
  author?: {
    name: string
    email: string
  }
  edition?: {
    title: string
    publishDate: string
  }
}

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.relative')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/editorial/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        console.error('Failed to fetch articles')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateArticleStatus = async (articleId: string, newStatus: string) => {
    setIsUpdating(articleId)
    try {
      const response = await fetch(`/api/editorial/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchArticles() // Refresh the list
      } else {
        console.error('Failed to update article status')
      }
    } catch (error) {
      console.error('Error updating article status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const deleteArticle = async (articleId: string, articleTitle: string) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to permanently delete the article "${articleTitle}"? This action cannot be undone.`)) {
      return
    }

    setIsUpdating(articleId)
    try {
      const response = await fetch(`/api/editorial/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('✅ Article deleted successfully!')
        await fetchArticles() // Refresh the list
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to delete article'}`)
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('❌ Error deleting article')
    } finally {
      setIsUpdating(null)
    }
  }

    const archiveArticle = async (id: string) => {
    if (!confirm('Are you sure you want to archive this article?')) return
    
    try {
      const response = await fetch(`/api/editorial/articles/${id}/archive`, {
        method: 'PATCH',
      })
      
      if (response.ok) {
        await fetchArticles()
        alert('Article archived successfully!')
      } else {
        throw new Error('Failed to archive article')
      }
    } catch (error) {
      console.error('Error archiving article:', error)
      alert('Failed to archive article. Please try again.')
    }
  }

  const unarchiveArticle = async (id: string) => {
    if (!confirm('Are you sure you want to unarchive this article?')) return
    
    try {
      const response = await fetch(`/api/editorial/articles/${id}/unarchive`, {
        method: 'PATCH',
      })
      
      if (response.ok) {
        await fetchArticles()
        alert('Article unarchived successfully!')
      } else {
        throw new Error('Failed to unarchive article')
      }
    } catch (error) {
      console.error('Error unarchiving article:', error)
      alert('Failed to unarchive article. Please try again.')
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canUpdateStatus = (currentStatus: string) => {
    // Editors can only move DRAFT articles to UNDER_REVIEW for submission
    // They cannot approve or reject articles - only publishers can do that
    return currentStatus === 'DRAFT'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading articles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title and Button */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Article Management</h2>
        <p className="text-sm sm:text-base text-gray-600">Create and manage articles for your newsletter editions</p>
        <button
          onClick={() => setShowAddArticle(true)}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium flex items-center justify-center sm:justify-start transition-colors duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Article
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              {['ALL', 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Articles' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Articles ({filteredArticles.length})
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <p className="text-gray-500 text-sm sm:text-base">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {filteredArticles.map((article) => (
              <div key={article.id} className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150 ${
                article.status === 'ARCHIVED' ? 'bg-gray-50/50' : ''
              }`}>
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <h4 className={`text-base sm:text-lg font-medium ${
                        article.status === 'ARCHIVED' ? 'text-gray-500' : 'text-gray-900'
                      } break-words`}>
                        {article.status === 'ARCHIVED' && '📁 '}
                        {article.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full self-start ${getStatusBadgeColor(article.status)}`}>
                        {article.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {article.excerpt && (
                      <p className={`text-sm ${
                        article.status === 'ARCHIVED' ? 'text-gray-400' : 'text-gray-600'
                      } line-clamp-2`}>
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm ${
                      article.status === 'ARCHIVED' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                      {article.publishedAt && (
                        <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                      {article.edition && (
                        <span className="break-all sm:break-normal">Edition: {article.edition.title}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 sm:ml-4 flex-shrink-0">
                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === article.id ? null : article.id)}
                        className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                        title="More actions"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === article.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            {/* Edit Action - Not available for archived articles */}
                            {/* {article.status !== 'ARCHIVED' && ( */}
                              <button
                                onClick={() => {
                                  setEditingArticle(article)
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Article
                              </button>
                            {/* )} */}
                            
                            {/* Archive/Unarchive Action */}
                            {article.status === 'ARCHIVED' ? (
                              <button
                                onClick={() => {
                                  unarchiveArticle(article.id)
                                  setOpenDropdown(null)
                                }}
                                disabled={isUpdating === article.id}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3 3 3M7 8l3 3 3-3" />
                                </svg>
                                {isUpdating === article.id ? 'Unarchiving...' : 'Unarchive Article'}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  archiveArticle(article.id)
                                  setOpenDropdown(null)
                                }}
                                disabled={isUpdating === article.id}
                                className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4" />
                                </svg>
                                {isUpdating === article.id ? 'Archiving...' : 'Archive Article'}
                              </button>
                            )}
                            
                            {/* Delete Action - Only for DRAFT articles */}
                            {/* {article.status === 'DRAFT' && ( */}
                              <button
                                onClick={() => {
                                  deleteArticle(article.id, article.title)
                                  setOpenDropdown(null)
                                }}
                                disabled={isUpdating === article.id}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {isUpdating === article.id ? 'Deleting...' : 'Delete Article'}
                              </button>
                            {/* )} */}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {canUpdateStatus(article.status) && (
                      <>
                        {article.status === 'DRAFT' && (
                          <button
                            onClick={() => updateArticleStatus(article.id, 'UNDER_REVIEW')}
                            disabled={isUpdating === article.id}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded hover:bg-blue-200 disabled:opacity-50 transition-colors duration-150 whitespace-nowrap"
                          >
                            {isUpdating === article.id ? '...' : 'Submit for Review'}
                          </button>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
                      title="View Article"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showAddArticle && (
        <AddArticle
          onClose={() => setShowAddArticle(false)}
          onSuccess={fetchArticles}
        />
      )}
      
      {editingArticle && (
        <EditArticle
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onUpdate={fetchArticles}
        />
      )}
    </div>
  )
}
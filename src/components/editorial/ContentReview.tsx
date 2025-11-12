'use client'

import { useState, useEffect, useCallback } from 'react'
import EditArticle from '@/components/editorial/EditArticle'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  readTime?: number
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  contentType: string
  editionId: string
  author?: {
    name: string
    email: string
  }
  edition?: {
    id: string
    title: string
    publishDate: string
    editionNumber: number
  }
  reviewNotes?: ReviewNote[]
}

interface ReviewNote {
  id: string
  note: string
  decision: string
  createdAt: string
  reviewer: {
    name: string
    email: string
  }
  highlights?: { selectedText: string; comment?: string }[] // JSON data from database
}

export default function ContentReview() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'UNDER_REVIEW' | 'REJECTED'>('UNDER_REVIEW')

  const selectArticle = async (article: Article) => {
    try {
      setLoading(true)
      // Fetch full article details including content
      const response = await fetch(`/api/editorial/articles/${article.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedArticle(data.article)
      } else {
        console.error('Failed to fetch article details')
        // Fallback to the article from the list (without content)
        setSelectedArticle(article)
      }
    } catch (error) {
      console.error('Error fetching article details:', error)
      // Fallback to the article from the list (without content)
      setSelectedArticle(article)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = useCallback(async () => {
    try {
      const response = await fetch(`/api/editorial/articles?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

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
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Content Review & Feedback</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          View articles under review and those rejected with feedback for improvement
        </p>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
          <button
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm ${
              statusFilter === 'REJECTED'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Needs Revision
          </button>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'UNDER_REVIEW' ? 'No articles under review' : 'No articles need revision'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {statusFilter === 'UNDER_REVIEW' 
              ? 'All articles are either approved or need revision.' 
              : 'All rejected articles have been revised and resubmitted.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  {statusFilter === 'UNDER_REVIEW' ? 'Under Review' : 'Needs Revision'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => selectArticle(article)}
                    className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      selectedArticle?.id === article.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <h5 className="font-medium text-gray-900 truncate">{article.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusFilter === 'UNDER_REVIEW' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {statusFilter === 'UNDER_REVIEW' ? 'Under Review' : 'Rejected'}
                      </span>
                      <span className="ml-2">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article Preview */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h3>
                      {selectedArticle.edition && (
                        <p className="text-sm text-gray-600 mt-1">
                          Edition: {selectedArticle.edition.title}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusFilter === 'UNDER_REVIEW' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {statusFilter === 'UNDER_REVIEW' ? 'Under Review' : 'Needs Revision'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                  {/* Show publisher feedback for rejected articles */}
                  {statusFilter === 'REJECTED' && selectedArticle.reviewNotes && selectedArticle.reviewNotes.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Publisher Feedback - Action Required
                      </h4>
                      <div className="space-y-3">
                        {selectedArticle.reviewNotes.filter(note => note.decision === 'REJECTED').map((note) => (
                          <div key={note.id} className="bg-white p-3 rounded border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-red-900">
                                {note.reviewer.name} (Publisher)
                              </span>
                              <span className="text-xs text-red-600">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-red-800 mb-2">{note.note}</p>
                            
                            {/* Show highlights if any */}
                            {note.highlights && Array.isArray(note.highlights) && note.highlights.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-red-700 mb-2">Highlighted Issues:</p>
                                <div className="space-y-1">
                                  {note.highlights.map((highlight: { selectedText: string; comment?: string }, index: number) => (
                                    <div key={`${note.id}-highlight-${index}`} className="text-xs bg-yellow-50 p-2 rounded border border-yellow-300">
                                      <p className="font-medium text-yellow-800">&quot;{highlight.selectedText}&quot;</p>
                                      {highlight.comment && (
                                        <p className="text-yellow-700 mt-1">💡 {highlight.comment}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          ℹ️ <strong>Next Steps:</strong> Address the feedback above, make necessary revisions to your article, and resubmit it for review.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedArticle.excerpt && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Excerpt</h4>
                      <p className="text-gray-700 italic">{selectedArticle.excerpt}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    <div 
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                  </div>

                  {/* Show all review history */}
                  {selectedArticle.reviewNotes && selectedArticle.reviewNotes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Review History</h4>
                      <div className="space-y-3">
                        {selectedArticle.reviewNotes.map((note) => (
                          <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {note.reviewer.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                note.decision === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {note.decision}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{note.note}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedArticle.metaTitle || selectedArticle.metaDescription) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">SEO Metadata</h4>
                      {selectedArticle.metaTitle && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">Title:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaTitle}</p>
                        </div>
                      )}
                      {selectedArticle.metaDescription && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaDescription}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-6 py-4 border-t border-gray-200">
                  {statusFilter === 'REJECTED' ? (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        📝 This article was rejected and needs revision. Please address the feedback above.
                      </p>
                      <button
                        onClick={() => setEditingArticle(selectedArticle)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                      >
                        Edit Article
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        ⏳ This article is under review by the publisher. No action required at this time.
                      </p>
                      <button
                        onClick={() => window.open(`/article/${selectedArticle.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Preview Article →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Article</h3>
                <p className="text-gray-600">Choose an article from the list to view its details and feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <EditArticle
          article={{
            ...editingArticle,
            readTime: editingArticle.readTime || 0,
            metaTitle: editingArticle.metaTitle || '',
            metaDescription: editingArticle.metaDescription || ''
          }}
          onClose={() => setEditingArticle(null)}
          onUpdate={() => {
            fetchArticles() // Refresh articles after update
            setSelectedArticle(null) // Clear selection to refresh the detail view
          }}
        />
      )}
    </div>
  )
}

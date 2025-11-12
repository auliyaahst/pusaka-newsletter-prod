'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Edition {
  id: string
  title: string
  description: string | null
  publishDate: string
  editionNumber: number | null
  theme: string | null
  coverImage: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  _count: {
    articles: number
  }
}

export default function EditionManagement() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: '',
    coverImage: ''
  })

  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/admin/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      } else {
        console.error('Failed to fetch editions')
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          editionNumber: formData.editionNumber ? parseInt(formData.editionNumber) : null
        }),
      })

      if (response.ok) {
        toast.success('Edition created and published successfully!')
        setShowAddForm(false)
        setFormData({
          title: '',
          description: '',
          publishDate: '',
          editionNumber: '',
          theme: '',
          coverImage: ''
        })
        await fetchEditions() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to create edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      toast.error('Error creating edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePublished = async (editionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/editions/${editionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      })

      if (response.ok) {
        await fetchEditions() // Refresh the list
      } else {
        toast.error('Failed to update edition status')
      }
    } catch (error) {
      console.error('Error updating edition:', error)
      toast.error('Error updating edition')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading editions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Edition Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Edition
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Edition</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="publishDate"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="editionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Edition Number
                    </label>
                    <input
                      type="number"
                      id="editionNumber"
                      min="1"
                      value={formData.editionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/cover-image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Edition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Editions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Newsletter Editions ({editions.length})
          </h3>
        </div>

        {editions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No editions found. Create your first edition to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {editions.map((edition) => (
              <div key={edition.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {edition.title}
                      </h4>
                      {edition.editionNumber && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          #{edition.editionNumber}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        edition.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {edition.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    {edition.description && (
                      <p className="text-gray-600 mt-2">{edition.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>📅 {new Date(edition.publishDate).toLocaleDateString()}</span>
                      <span>📝 {edition._count.articles} articles</span>
                      {edition.theme && <span>🏷️ {edition.theme}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => togglePublished(edition.id, edition.isPublished)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        edition.isPublished
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {edition.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

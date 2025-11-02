'use client'

import { useState, useEffect } from 'react'
import { SimpleEditor } from '../tiptap-templates/simple/simple-editor'

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  isPublished: boolean
}

interface AddArticleProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddArticle({ onClose, onSuccess }: AddArticleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    editionId: '',
    featured: false,
    readTime: 5,
    metaTitle: '',
    metaDescription: ''
  })
  const [showCreateEdition, setShowCreateEdition] = useState(false)
  const [editionFormData, setEditionFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: ''
  })

  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editorial/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/editorial/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'DRAFT'
        }),
      })

      if (response.ok) {
        alert('✅ Article created successfully!')
        onClose()
        onSuccess()
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          slug: '',
          editionId: '',
          featured: false,
          readTime: 5,
          metaTitle: '',
          metaDescription: ''
        })
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to create article'}`)
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('❌ Error creating article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/editorial/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editionFormData,
          editionNumber: editionFormData.editionNumber ? parseInt(editionFormData.editionNumber) : null
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ Edition created and published successfully!')
        
        // Refresh editions list
        await fetchEditions()
        
        // Select the newly created edition
        setFormData(prev => ({ ...prev, editionId: result.edition.id }))
        
        // Close the create edition form
        setShowCreateEdition(false)
        setEditionFormData({
          title: '',
          description: '',
          publishDate: '',
          editionNumber: '',
          theme: ''
        })
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to create edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      alert('❌ Error creating edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">✨ Create New Article</h3>
              <p className="text-sm text-gray-600 mt-1">Fill in the details below to create your article. Fields marked with * are required.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                📝 Basic Information
              </h4>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Article Title *
                </label>
                <p className="text-xs text-gray-500 mb-2">This will be the main headline of your article</p>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter a compelling title for your article"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <p className="text-xs text-gray-500 mb-2">This will be part of the article&apos;s web address (auto-generated from title)</p>
                <input
                  type="text"
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="article-url-slug"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Article Summary
                </label>
                <p className="text-xs text-gray-500 mb-2">A brief description of what this article is about (optional)</p>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Write a brief summary of your article..."
                />
              </div>
            </div>

            {/* Article Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                ⚙️ Article Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
                    📖 Estimated Reading Time
                  </label>
                  <p className="text-xs text-gray-500 mb-2">How long will it take to read this article? (in minutes)</p>
                  <input
                    type="number"
                    id="readTime"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                
                <div>
                  <label htmlFor="editionId" className="block text-sm font-medium text-gray-700 mb-1">
                    📰 Newsletter Edition
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Assign this article to a specific newsletter edition (optional)</p>
                  <select
                    id="editionId"
                    value={formData.editionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, editionId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No specific edition</option>
                    {editions.map((edition) => (
                      <option key={edition.id} value={edition.id}>
                        {edition.title} {edition.editionNumber ? `(#${edition.editionNumber})` : ''} {!edition.isPublished ? '- Draft' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateEdition(true)}
                    className="mt-2 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center border border-blue-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Edition
                  </button>
                </div>
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-3 block text-sm text-gray-700 font-medium">
                  ⭐ Featured Article
                </label>
                <p className="ml-2 text-xs text-gray-500">
                  Mark as featured to highlight this article on the homepage
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                ✍️ Article Content
              </h4>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Write Your Article *
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Write your article content below using the rich text editor.
                </p>
                <div className="w-full">
                  <SimpleEditor 
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Start writing your amazing article here..."
                    height="450px"
                  />
                </div>
                {/* Hidden textarea for form validation */}
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="sr-only"
                  required
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                🔍 SEO Settings
              </h4>
              <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg">
                💡 These settings help your article appear better in search engines and social media. (All optional)
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Title that appears in search results (uses article title if empty)</p>
                  <input
                    type="text"
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO-optimized title"
                  />
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Brief description that appears in search results</p>
                  <textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Write a compelling description for search engines..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.content}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    📄 Create Article
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Edition Modal */}
      {showCreateEdition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">📰 Create New Edition</h3>
                <button
                  onClick={() => setShowCreateEdition(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateEdition} className="space-y-4">
                <div>
                  <label htmlFor="editionTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="editionTitle"
                    required
                    value={editionFormData.title}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="editionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="editionDescription"
                    value={editionFormData.description}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editionPublishDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="editionPublishDate"
                      required
                      value={editionFormData.publishDate}
                      onChange={(e) => setEditionFormData(prev => ({ ...prev, publishDate: e.target.value }))}
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
                      value={editionFormData.editionNumber}
                      onChange={(e) => setEditionFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editionTheme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="editionTheme"
                    value={editionFormData.theme}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEdition(false)}
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
    </div>
  )
}

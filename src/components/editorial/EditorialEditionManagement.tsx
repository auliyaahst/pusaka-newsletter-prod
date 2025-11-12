'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

interface Article {
  id: string
  title: string
  excerpt: string
  status: string
  createdAt: string
  author: {
    name: string
    email: string
  }
}

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
  _count?: {
    articles: number
  }
  articles?: Article[]
}

export default function EditorialEditionManagement() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null)
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null)
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [coverImages, setCoverImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: '',
    coverImage: '',
    isPublished: false
  })

  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editorial/editions')  // Changed from /api/publisher/editions
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      } else {
        // console.error('Failed to fetch editions')
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEditionArticles = async (editionId: string) => {
    setLoadingArticles(true)
    try {
      const response = await fetch(`/api/editorial/editions/${editionId}/articles`)  // Changed from /api/publisher/editions
      if (response.ok) {
        const data = await response.json()
        setSelectedEdition(data.edition)
      } else {
        // console.error('Failed to fetch edition articles')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoadingArticles(false)
    }
  }

  const handleEditionClick = (edition: Edition) => {
    if (selectedEdition?.id === edition.id) {
      setSelectedEdition(null)
    } else {
      fetchEditionArticles(edition.id)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      publishDate: '',
      editionNumber: '',
      theme: '',
      coverImage: '',
      isPublished: false
    })
    setEditingEdition(null)
    setCoverImages([])
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds maximum allowed (5MB)')
    }
    
    // Convert to base64 for immediate preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const handleMultipleFilesSelect = async (files: FileList) => {
    setIsUploading(true)
    const maxFiles = 10 // Maximum number of images allowed

    if (coverImages.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`)
      setIsUploading(false)
      return
    }

    try {
      const uploadPromises = Array.from(files).map((file) => handleImageUpload(file))
      
      // Simulate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setUploadProgress(Math.min(progress, 90))
      }, 100)

      const uploadedImages = await Promise.all(uploadPromises)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setCoverImages(prev => [...prev, ...uploadedImages])
      
      // Update formData with first image as primary or JSON array
      const allImages = [...coverImages, ...uploadedImages]
      setFormData(prev => ({ 
        ...prev, 
        coverImage: JSON.stringify(allImages) // Store as JSON array
      }))

      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleMultipleFilesSelect(files)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleMultipleFilesSelect(files)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = coverImages.filter((_, i) => i !== index)
    setCoverImages(newImages)
    setFormData(prev => ({ 
      ...prev, 
      coverImage: newImages.length > 0 ? JSON.stringify(newImages) : ''
    }))
  }

  const handleRemoveAllImages = () => {
    setCoverImages([])
    setFormData(prev => ({ ...prev, coverImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEdit = (edition: Edition, e: React.MouseEvent) => {
    e.stopPropagation()
    
    let images: string[] = []
    if (edition.coverImage) {
      // Check if it's a JSON array or a single URL
      if (edition.coverImage.startsWith('[')) {
        // It's a JSON array
        try {
          images = JSON.parse(edition.coverImage)
          if (!Array.isArray(images)) {
            images = [edition.coverImage]
          }
        } catch (error) {
          // console.error('Failed to parse JSON array:', error)
          images = [edition.coverImage]
        }
      } else if (edition.coverImage.startsWith('http') || edition.coverImage.startsWith('data:')) {
        // It's a single URL (http/https or base64 data URL)
        images = [edition.coverImage]
      } else {
        // Try parsing as JSON as fallback
        try {
          images = JSON.parse(edition.coverImage)
          if (!Array.isArray(images)) {
            images = [edition.coverImage]
          }
        } catch (error) {
          // If all else fails, treat as single image
          images = [edition.coverImage]
        }
      }
    }
    
    // console.log('Parsed images:', images)
    // console.log('Images length:', images.length)
    
    // Set all states BEFORE showing the modal
    setEditingEdition(edition)
    setFormData({
      title: edition.title,
      description: edition.description || '',
      publishDate: edition.publishDate.split('T')[0],
      editionNumber: edition.editionNumber?.toString() || '',
      theme: edition.theme || '',
      coverImage: edition.coverImage || '',
      isPublished: edition.isPublished
    })
    
    // Set images and wait for next tick before showing modal
    setCoverImages(images)
    
    // Use setTimeout to ensure state updates before modal renders
    setTimeout(() => {
      setShowEditForm(true)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingEdition 
        ? `/api/editorial/editions/${editingEdition.id}`
        : '/api/editorial/editions'
      
      const response = await fetch(url, {
        method: editingEdition ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          editionNumber: formData.editionNumber ? parseInt(formData.editionNumber) : null
        }),
      })

      if (response.ok) {
        const action = editingEdition ? 'updated' : 'created'
        toast.success(`Edition ${action} successfully!`)
        setShowAddForm(false)
        setShowEditForm(false)
        resetForm()
        await fetchEditions()
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to save edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      toast.error('Failed to create edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (editionId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/editorial/editions/${editionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Edition deleted successfully!')
        if (selectedEdition?.id === editionId) {
          setSelectedEdition(null)
        }
        await fetchEditions()
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to delete edition'}`)
      }
    } catch (error) {
      console.error('Error deleting edition:', error)
      toast.error('Failed to delete edition')
    }
  }

  const togglePublished = async (editionId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/editorial/editions/${editionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      })

      if (response.ok) {
        await fetchEditions()
        if (selectedEdition?.id === editionId) {
          await fetchEditionArticles(editionId)
        }
      } else {
        toast.error('Failed to update edition status')
      }
    } catch (error) {
      console.error('Error updating edition:', error)
      toast.error('Failed to update edition')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PUBLISHED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-900"></div>
        <span className="ml-3 text-sm sm:text-base text-gray-600">Loading editions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edition Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Create and manage newsletter editions. Click on an edition to view its articles.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium flex items-center justify-center sm:justify-start flex-shrink-0"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Create New Edition</span>
        </button>
      </div>

      {/* Add/Edit Form Modal - Same as before with purple colors */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingEdition ? 'Edit Edition' : 'Create New Edition'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setShowEditForm(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="publishDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="publishDate"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="editionNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Edition Number
                    </label>
                    <input
                      type="number"
                      id="editionNumber"
                      min="1"
                      value={formData.editionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="theme" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                {/* Cover Images Upload - Multiple */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Cover Images {coverImages.length > 0 && `(${coverImages.length}/10)`}
                  </label>
                  
                  {/* Upload Zone - Always visible like Publisher */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (max 10 images)</p>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Image Preview Grid - Below upload zone like Publisher */}
                  {coverImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          Uploaded Images ({coverImages.length})
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveAllImages}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {coverImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Cover ${index + 1}`}
                              className="w-full h-24 xs:h-28 sm:h-32 md:h-36 object-cover rounded-lg"
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 rounded">
                                Primary
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveImage(index)
                              }}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 xs:p-1.5 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isPublished" className="text-xs sm:text-sm font-medium text-gray-700">
                    Publish immediately
                  </label>
                </div> */}

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setShowEditForm(false)
                      resetForm()
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? (editingEdition ? 'Updating...' : 'Creating...') : (editingEdition ? 'Update Edition' : 'Create Edition')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Editions List with expandable articles */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Newsletter Editions ({editions.length})
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage all newsletter editions and control their publication status.</p>
        </div>

        {editions.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-500">No editions found. Create your first edition to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {editions.map((edition) => (
              <div key={edition.id} className="transition-colors">
                {/* Edition Header - Clickable */}
                <div 
                  onClick={() => handleEditionClick(edition)}
                  className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                          {edition.title}
                        </h4>
                        {edition.editionNumber && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                            #{edition.editionNumber}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          edition.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {edition.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {selectedEdition?.id === edition.id && (
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                      
                      {edition.description && (
                        <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">{edition.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <span>📅 {new Date(edition.publishDate).toLocaleDateString()}</span>
                        <span>📝 {edition._count?.articles ?? 0} {(edition._count?.articles ?? 0) === 1 ? 'article' : 'articles'}</span>
                        {edition.theme && <span className="break-words">🏷️ {edition.theme}</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                      <button
                        onClick={(e) => handleEdit(edition, e)}
                        className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs sm:text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => togglePublished(edition.id, edition.isPublished, e)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          edition.isPublished
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {edition.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={(e) => handleDelete(edition.id, edition.title, e)}
                        className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs sm:text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Articles List - Expanded */}
                {selectedEdition?.id === edition.id && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {loadingArticles ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading articles...</span>
                      </div>
                    ) : selectedEdition.articles && selectedEdition.articles.length > 0 ? (
                      <div className="px-4 sm:px-6 py-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Articles in this edition:</h5>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedEdition.articles.map((article) => (
                            <div key={article.id} className="bg-white p-3 sm:p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h6 className="text-sm sm:text-base font-medium text-gray-900 break-words">{article.title}</h6>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                    <span>✍️ {article.author.name}</span>
                                    <span>•</span>
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getStatusBadge(article.status)}`}>
                                  {article.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 sm:px-6 py-8 text-center">
                        <p className="text-sm text-gray-500">No articles in this edition yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
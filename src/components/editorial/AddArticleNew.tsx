'use client'

import { useState, useEffect } from 'react'
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"

// Custom editor component for the article form
interface CustomSimpleEditorProps {
  readonly content: string
  readonly onChange: (content: string) => void
}

function CustomSimpleEditor({ content, onChange }: CustomSimpleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
    ],
    content: content || '<p>Start writing your amazing article...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[300px] p-3',
      },
    },
    immediatelyRender: false,
  })

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) {
    return <div className="min-h-[300px] p-3 text-gray-400">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor">
      {/* Simple toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('bold') 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('italic') 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 2 }) 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 3 }) 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('bulletList') 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('orderedList') 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Numbered
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm font-medium ${
            editor.isActive('blockquote') 
              ? 'bg-blue-100 text-blue-700' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Quote
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
}

interface AddArticleProps {
  readonly onClose: () => void
  readonly onSuccess: () => void
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
    metaDescription: '',
    contentType: 'HTML' as 'HTML' | 'MARKDOWN'
  })

  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
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
      const response = await fetch('/api/editorial/articles-working', {
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
        alert('Article created successfully!')
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
          metaDescription: '',
          contentType: 'HTML'
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to create article'}`)
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Error creating article')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create New Article</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Content Type and Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  id="contentType"
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as 'HTML' | 'MARKDOWN' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="HTML">HTML</option>
                  <option value="MARKDOWN">Markdown</option>
                </select>
              </div>
              <div>
                <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  id="readTime"
                  min="1"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Edition and Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="editionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Edition (Optional)
                </label>
                <select
                  id="editionId"
                  value={formData.editionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, editionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Edition</option>
                  {editions.map((edition) => (
                    <option key={edition.id} value={edition.id}>
                      {edition.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Article
                </label>
              </div>
            </div>

            {/* Article Content */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">✍️</span>
                <h3 className="text-lg font-semibold text-gray-800">Article Content</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Write your article content below.
              </p>
              <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <CustomSimpleEditor 
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">🔍</span>
                <h3 className="text-lg font-semibold text-gray-800">SEO Settings</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                These settings help your article appear better in search engines and social media. (All optional)
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <p className="text-xs text-gray-500 mb-1">Title that appears in search results (uses article title if empty)</p>
                  <input
                    type="text"
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO-optimized title"
                  />
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <p className="text-xs text-gray-500 mb-1">Brief description that appears in search results</p>
                  <textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Write a compelling description for search engines..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

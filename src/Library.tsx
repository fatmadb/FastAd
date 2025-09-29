import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Edit3,
  FileImage,
  Video,
  Share2,
  Copy,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import { ContentItem } from '../../types'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const Library: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const { user } = useAuth()

  const types = ['image', 'video', 'banner', 'social']
  const platforms = ['facebook', 'instagram', 'youtube', 'google_ads', 'twitter', 'linkedin']
  const styles = ['realistic', 'surreal', 'anime', 'futuristic']

  useEffect(() => {
    fetchContentItems()
  }, [user])

  const fetchContentItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContentItems(data || [])
    } catch (error) {
      console.error('Error fetching content items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
    const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform)
    const matchesStyle = selectedStyles.length === 0 || selectedStyles.includes(item.style)

    return matchesSearch && matchesType && matchesPlatform && matchesStyle
  })

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setContentItems(prev => prev.filter(item => item.id !== itemId))
      if (selectedItem?.id === itemId) {
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item')
    }
  }

  const downloadItem = async (item: ContentItem) => {
    try {
      const response = await fetch(item.output_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fastad-${item.title}-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading item:', error)
      alert('Error downloading item')
    }
  }

  const toggleFilter = (filterType: string, value: string, currentFilters: string[], setFilters: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter(f => f !== value))
    } else {
      setFilters([...currentFilters, value])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Library</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your generated content ({filteredItems.length} items)
          </p>
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-blue text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-blue text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('type', type, selectedTypes, setSelectedTypes)}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      selectedTypes.includes(type)
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => toggleFilter('platform', platform, selectedPlatforms, setSelectedPlatforms)}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleFilter('style', style, selectedStyles, setSelectedStyles)}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      selectedStyles.includes(style)
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className={`${selectedItem ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {filteredItems.length === 0 ? (
              <div className="card text-center py-12">
                <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-500 mb-4">
                  {contentItems.length === 0 
                    ? "You haven't created any content yet. Start generating to see your projects here."
                    : "No items match your current filters."
                  }
                </p>
                {contentItems.length === 0 && (
                  <a
                    href="/generate"
                    className="btn-primary inline-flex items-center"
                  >
                    Create Your First Project
                  </a>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="card cursor-pointer group"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {item.type === 'video' ? (
                          <video
                            src={item.output_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.output_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button className="p-1 bg-white rounded shadow-sm">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                          <span className="capitalize">{item.type} • {item.platform.replace('_', ' ')}</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Platform</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              {item.type === 'video' ? (
                                <Video className="w-5 h-5 text-gray-400" />
                              ) : (
                                <FileImage className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description || item.prompt}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize">{item.type}</td>
                        <td className="py-3 px-4 capitalize">{item.platform.replace('_', ' ')}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => downloadItem(item)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar Detail View */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card lg:col-span-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Preview */}
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {selectedItem.type === 'video' ? (
                        <video
                          src={selectedItem.output_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={selectedItem.output_url}
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <p className="text-gray-900">{selectedItem.title}</p>
                    </div>
                    
                    {selectedItem.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <p className="text-gray-900">{selectedItem.description}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Prompt</label>
                      <p className="text-gray-900 text-sm">{selectedItem.prompt}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <p className="text-gray-900 capitalize">{selectedItem.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Platform</label>
                        <p className="text-gray-900 capitalize">{selectedItem.platform.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Style</label>
                        <p className="text-gray-900 capitalize">{selectedItem.style}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <p className="text-gray-900 text-sm">
                          {new Date(selectedItem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadItem(selectedItem)}
                      className="flex-1 btn-primary flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteItem(selectedItem.id)}
                    className="w-full flex items-center justify-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Library

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Upload, 
  Edit3, 
  Trash2, 
  Save,
  EyeDropper,
  Font,
  Image as ImageIcon,
  Check
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import { BrandKit } from '../../types'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

interface BrandKitForm {
  brand_name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
}

const BrandKit: React.FC = () => {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { user } = useAuth()

  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Lato',
    'Poppins',
    'Source Sans Pro',
    'Merriweather'
  ]

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<BrandKitForm>()

  const watchPrimaryColor = watch('primary_color', '#1E40AF')
  const watchSecondaryColor = watch('secondary_color', '#8B5CF6')
  const watchAccentColor = watch('accent_color', '#06B6D4')

  useEffect(() => {
    fetchBrandKits()
  }, [user])

  const fetchBrandKits = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBrandKits(data || [])
    } catch (error) {
      console.error('Error fetching brand kits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setEditingKit(null)
    reset({
      brand_name: '',
      primary_color: '#1E40AF',
      secondary_color: '#8B5CF6',
      accent_color: '#06B6D4',
      font_family: 'Inter'
    })
  }

  const handleEdit = (kit: BrandKit) => {
    setEditingKit(kit)
    setIsCreating(false)
    reset({
      brand_name: kit.brand_name,
      primary_color: kit.primary_color,
      secondary_color: kit.secondary_color,
      accent_color: kit.accent_color,
      font_family: kit.font_family
    })
  }

  const handleCancel = () => {
    setEditingKit(null)
    setIsCreating(false)
    reset()
  }

  const onSubmit = async (data: BrandKitForm) => {
    if (!user) return

    try {
      if (editingKit) {
        // Update existing brand kit
        const { error } = await supabase
          .from('brand_kits')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingKit.id)

        if (error) throw error

        setBrandKits(prev => prev.map(kit => 
          kit.id === editingKit.id ? { ...kit, ...data } : kit
        ))
        setEditingKit(null)
      } else if (isCreating) {
        // Create new brand kit
        const { data: newKit, error } = await supabase
          .from('brand_kits')
          .insert({
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        setBrandKits(prev => [newKit, ...prev])
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error saving brand kit:', error)
      alert('Error saving brand kit')
    }
  }

  const deleteBrandKit = async (kitId: string) => {
    if (!confirm('Are you sure you want to delete this brand kit?')) return

    try {
      const { error } = await supabase
        .from('brand_kits')
        .delete()
        .eq('id', kitId)

      if (error) throw error

      setBrandKits(prev => prev.filter(kit => kit.id !== kitId))
      if (editingKit?.id === kitId) {
        setEditingKit(null)
      }
    } catch (error) {
      console.error('Error deleting brand kit:', error)
      alert('Error deleting brand kit')
    }
  }

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>, kitId: string) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingLogo(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${kitId}-${Math.random()}.${fileExt}`
      const filePath = `logos/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('brand_kits')
        .update({ logo_url: publicUrl })
        .eq('id', kitId)

      if (updateError) throw updateError

      setBrandKits(prev => prev.map(kit => 
        kit.id === kitId ? { ...kit, logo_url: publicUrl } : kit
      ))

      if (editingKit?.id === kitId) {
        setEditingKit(prev => prev ? { ...prev, logo_url: publicUrl } : null)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const ColorPicker = ({ name, value, onChange }: any) => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
        />
        <EyeDropper className="absolute inset-0 m-auto w-6 h-6 text-white pointer-events-none" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
      />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Kit Manager</h1>
          <p className="text-gray-600 mt-2">
            Create and manage brand kits to maintain consistency across your marketing content
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand Kits List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Brand Kits</h2>
                <button
                  onClick={handleCreateNew}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Kit</span>
                </button>
              </div>

              <div className="space-y-3">
                {brandKits.map((kit) => (
                  <motion.div
                    key={kit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      editingKit?.id === kit.id
                        ? 'border-primary-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEdit(kit)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{kit.brand_name}</h3>
                      {editingKit?.id === kit.id && (
                        <Check className="w-4 h-4 text-primary-blue" />
                      )}
                    </div>
                    <div className="flex space-x-1 mb-3">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: kit.primary_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: kit.secondary_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: kit.accent_color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span style={{ fontFamily: kit.font_family }}>{kit.font_family}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBrandKit(kit.id)
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {brandKits.length === 0 && !isCreating && (
                  <div className="text-center py-8">
                    <Font className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No brand kits created yet</p>
                    <button
                      onClick={handleCreateNew}
                      className="btn-primary mt-3"
                    >
                      Create Your First Brand Kit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brand Kit Editor */}
          <div className="lg:col-span-2">
            {(editingKit || isCreating) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {isCreating ? 'Create New Brand Kit' : 'Edit Brand Kit'}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isDirty}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name
                    </label>
                    <input
                      {...register('brand_name', { required: 'Brand name is required' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      placeholder="Enter your brand name"
                    />
                    {errors.brand_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.brand_name.message}</p>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {(editingKit?.logo_url || uploadingLogo) ? (
                          uploadingLogo ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <img
                              src={editingKit?.logo_url}
                              alt="Logo"
                              className="w-16 h-16 object-contain"
                            />
                          )
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={(e) => editingKit && uploadLogo(e, editingKit.id)}
                          className="hidden"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="btn-secondary cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color Palette
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Primary Color</label>
                        <ColorPicker
                          value={watchPrimaryColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setValue('primary_color', e.target.value, { shouldDirty: true })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Secondary Color</label>
                        <ColorPicker
                          value={watchSecondaryColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setValue('secondary_color', e.target.value, { shouldDirty: true })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Accent Color</label>
                        <ColorPicker
                          value={watchAccentColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setValue('accent_color', e.target.value, { shouldDirty: true })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      {...register('font_family')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      style={{ fontFamily: watch('font_family', 'Inter') }}
                    >
                      {fontFamilies.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preview
                    </label>
                    <div 
                      className="p-6 rounded-lg border border-gray-200"
                      style={{ 
                        backgroundColor: watchPrimaryColor + '20',
                        borderColor: watchPrimaryColor + '40'
                      }}
                    >
                      <div className="text-center">
                        <h3 
                          className="text-2xl font-bold mb-2"
                          style={{ 
                            color: watchPrimaryColor,
                            fontFamily: watch('font_family', 'Inter')
                          }}
                        >
                          {watch('brand_name') || 'Your Brand'}
                        </h3>
                        <p 
                          className="text-lg mb-4"
                          style={{ color: watchSecondaryColor }}
                        >
                          Marketing Content Example
                        </p>
                        <button
                          className="px-6 py-2 rounded-lg font-medium"
                          style={{ 
                            backgroundColor: watchAccentColor,
                            color: 'white'
                          }}
                        >
                          Call to Action
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {!editingKit && !isCreating && brandKits.length > 0 && (
              <div className="card text-center py-12">
                <Edit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Brand Kit</h3>
                <p className="text-gray-500">
                  Choose a brand kit from the list to edit, or create a new one to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandKit

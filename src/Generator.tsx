import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Image, 
  Video, 
  Sparkles, 
  Download,
  Copy,
  RefreshCw
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { aiService, GenerationOptions } from '../../services/openai'
import { supabase } from '../../services/supabase'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

interface GenerationForm {
  prompt: string
  type: 'image' | 'video' | 'banner' | 'social'
  platform: 'facebook' | 'instagram' | 'youtube' | 'google_ads' | 'twitter' | 'linkedin'
  style: 'realistic' | 'surreal' | 'anime' | 'futuristic'
}

const Generator: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [generationHistory, setGenerationHistory] = useState<any[]>([])
  const { subscription, user } = useAuth()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GenerationForm>({
    defaultValues: {
      type: searchParams.get('type') as any || 'image',
      platform: 'instagram',
      style: 'realistic'
    }
  })

  const watchType = watch('type')
  const watchPrompt = watch('prompt')

  useEffect(() => {
    // Auto-optimize prompt when user stops typing
    const timeoutId = setTimeout(async () => {
      if (watchPrompt && watchPrompt.length > 10) {
        const optimized = await aiService.optimizeTextPrompt(watchPrompt)
        setOptimizedPrompt(optimized)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [watchPrompt])

  const onSubmit = async (data: GenerationForm) => {
    if (!user) return

    // Check usage limits
    if (subscription && subscription.current_usage >= subscription.usage_limit) {
      alert('You have reached your generation limit for this month. Please upgrade your plan.')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const options: GenerationOptions = {
        prompt: optimizedPrompt || data.prompt,
        style: data.style,
        platform: data.platform,
        type: data.type
      }

      let result
      if (data.type === 'video') {
        result = await aiService.generateVideo(options)
      } else {
        result = await aiService.generateImage(options)
      }

      if (result.success && result.url) {
        setGeneratedImage(result.url)

        // Save to database
        const { error } = await supabase
          .from('content_items')
          .insert({
            user_id: user.id,
            title: `Generated ${data.type}`,
            description: data.prompt,
            prompt: optimizedPrompt || data.prompt,
            type: data.type,
            platform: data.platform,
            style: data.style,
            output_url: result.url,
            created_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error saving content:', error)
        }

        // Update usage
        await supabase
          .from('subscriptions')
          .update({ current_usage: (subscription?.current_usage || 0) + 1 })
          .eq('user_id', user.id)
      } else {
        alert(result.error || 'Generation failed')
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('An error occurred during generation')
    } finally {
      setIsGenerating(false)
    }
  }

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: '📱' },
    { value: 'facebook', label: 'Facebook', icon: '👥' },
    { value: 'youtube', label: 'YouTube', label: '📺' },
    { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' }
  ]

  const styles = [
    { value: 'realistic', label: 'Realistic', icon: '🎯' },
    { value: 'surreal', label: 'Surreal', icon: '🌌' },
    { value: 'anime', label: 'Anime', icon: '🇯🇵' },
    { value: 'futuristic', label: 'Futuristic', icon: '🚀' }
  ]

  const types = [
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'banner', label: 'Banner', icon: Image },
    { value: 'social', label: 'Social Post', icon: Image }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Content Generator</h1>
          <p className="text-gray-600 mt-2">Create stunning marketing content with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to create
                </label>
                <textarea
                  {...register('prompt', { 
                    required: 'Prompt is required',
                    minLength: { value: 10, message: 'Prompt must be at least 10 characters' }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="A modern tech startup banner with gradient background, laptop illustration, and clean typography..."
                />
                {errors.prompt && (
                  <p className="text-red-600 text-sm mt-1">{errors.prompt.message}</p>
                )}
              </div>

              {/* Optimized Prompt Preview */}
              {optimizedPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI-Optimized Prompt
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(optimizedPrompt)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-blue-800">{optimizedPrompt}</p>
                </motion.div>
              )}

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {types.map((type) => {
                    const Icon = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                          watchType === type.value
                            ? 'border-primary-blue bg-blue-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register('type')}
                          value={type.value}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 ${
                            watchType === type.value ? 'text-primary-blue' : 'text-gray-400'
                          }`} />
                          <span className="ml-2 block text-sm font-medium">
                            {type.label}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <label
                      key={platform.value}
                      className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                        watch('platform') === platform.value
                          ? 'border-primary-blue bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('platform')}
                        value={platform.value}
                        className="sr-only"
                      />
                      <span className="flex flex-col items-center text-sm">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium mt-1">{platform.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => (
                    <label
                      key={style.value}
                      className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                        watch('style') === style.value
                          ? 'border-primary-blue bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('style')}
                        value={style.value}
                        className="sr-only"
                      />
                      <span className="flex items-center text-sm">
                        <span className="text-lg mr-2">{style.icon}</span>
                        <span className="font-medium">{style.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !watchPrompt}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Content
                  </>
                )}
              </button>

              {/* Usage Info */}
              <div className="text-center text-sm text-gray-500">
                {subscription && (
                  <p>
                    {subscription.current_usage} of {subscription.usage_limit} generations used this month
                  </p>
                )}
              </div>
            </form>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            
            <AnimatePresence>
              {isGenerating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-96"
                >
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-3">AI is creating your content...</p>
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                    {watchType === 'video' ? (
                      <video 
                        src={generatedImage} 
                        controls 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <img 
                        src={generatedImage} 
                        alt="Generated content" 
                        className="max-w-full h-auto rounded"
                      />
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <a
                      href={generatedImage}
                      download={`fastad-generated-${Date.now()}.${watchType === 'video' ? 'mp4' : 'png'}`}
                      className="flex-1 btn-secondary flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Generate New
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <div className="text-center">
                    <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Your generated content will appear here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Generator

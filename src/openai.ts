import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - use server-side in production
})

export interface GenerationOptions {
  prompt: string
  style: 'realistic' | 'surreal' | 'anime' | 'futuristic'
  platform: 'facebook' | 'instagram' | 'youtube' | 'google_ads' | 'twitter' | 'linkedin'
  type: 'image' | 'video' | 'banner' | 'social'
  dimensions?: { width: number; height: number }
  brandKit?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
}

export interface GenerationResult {
  success: boolean
  url?: string
  error?: string
  id?: string
}

class AIService {
  private optimizePrompt(prompt: string, options: GenerationOptions): string {
    const stylePrompts = {
      realistic: 'photorealistic, high detail, professional photography',
      surreal: 'surreal, dreamlike, imaginative, artistic',
      anime: 'anime style, Japanese animation, vibrant colors',
      futuristic: 'futuristic, sci-fi, cyberpunk, advanced technology'
    }

    const platformPrompts = {
      facebook: 'Facebook post optimized, engaging, social media friendly',
      instagram: 'Instagram style, square format, visually appealing',
      youtube: 'YouTube thumbnail, eye-catching, high contrast',
      google_ads: 'Google Ads banner, professional, conversion optimized',
      twitter: 'Twitter card, horizontal format, attention grabbing',
      linkedin: 'LinkedIn professional, business oriented, clean design'
    }

    return `${prompt}. Style: ${stylePrompts[options.style]}. Platform: ${platformPrompts[options.platform]}. Professional marketing content, high quality, brand appropriate.`
  }

  async generateImage(options: GenerationOptions): Promise<GenerationResult> {
    try {
      const optimizedPrompt = this.optimizePrompt(options.prompt, options)

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: optimizedPrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      })

      const imageUrl = response.data[0]?.url

      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI')
      }

      return {
        success: true,
        url: imageUrl,
        id: response.data[0]?.revised_prompt || Date.now().toString()
      }
    } catch (error: any) {
      console.error('OpenAI Image Generation Error:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate image'
      }
    }
  }

  async optimizeTextPrompt(prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a marketing content expert. Optimize the user's prompt for AI image generation. Make it more descriptive, add relevant marketing keywords, and ensure it will produce high-quality marketing content. Keep it under 400 characters."
          },
          {
            role: "user",
            content: `Optimize this prompt for marketing content generation: "${prompt}"`
          }
        ],
        max_tokens: 200,
      })

      return response.choices[0]?.message?.content?.trim() || prompt
    } catch (error) {
      console.error('OpenAI Text Optimization Error:', error)
      return prompt
    }
  }

  async generateVideo(options: GenerationOptions): Promise<GenerationResult> {
    // Note: DALL-E doesn't generate videos. This is a placeholder for future video AI integration
    // For now, we'll return a mock response
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // In a real implementation, you would use a video generation API like:
      // - Runway ML
      // - Pika Labs
      // - Stable Video Diffusion
      
      return {
        success: true,
        url: `https://example.com/video-placeholder-${Date.now()}.mp4`,
        id: `video-${Date.now()}`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Video generation is currently in development'
      }
    }
  }
}

export const aiService = new AIService()

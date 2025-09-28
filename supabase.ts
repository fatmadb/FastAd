export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'canceled' | 'past_due'
          plan: 'free' | 'pro' | 'enterprise'
          current_period_end: string
          usage_limit: number
          current_usage: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'canceled' | 'past_due'
          plan?: 'free' | 'pro' | 'enterprise'
          current_period_end: string
          usage_limit: number
          current_usage?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'past_due'
          plan?: 'free' | 'pro' | 'enterprise'
          current_period_end?: string
          usage_limit?: number
          current_usage?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          prompt: string
          type: 'image' | 'video' | 'banner' | 'social'
          platform: 'facebook' | 'instagram' | 'youtube' | 'google_ads' | 'twitter' | 'linkedin'
          style: 'realistic' | 'surreal' | 'anime' | 'futuristic'
          output_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          prompt: string
          type: 'image' | 'video' | 'banner' | 'social'
          platform: 'facebook' | 'instagram' | 'youtube' | 'google_ads' | 'twitter' | 'linkedin'
          style: 'realistic' | 'surreal' | 'anime' | 'futuristic'
          output_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          prompt?: string
          type?: 'image' | 'video' | 'banner' | 'social'
          platform?: 'facebook' | 'instagram' | 'youtube' | 'google_ads' | 'twitter' | 'linkedin'
          style?: 'realistic' | 'surreal' | 'anime' | 'futuristic'
          output_url?: string
        }
      }
      brand_kits: {
        Row: {
          id: string
          user_id: string
          brand_name: string
          primary_color: string
          secondary_color: string
          accent_color: string
          font_family: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_name: string
          primary_color: string
          secondary_color: string
          accent_color: string
          font_family: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_name?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          font_family?: string
          logo_url?: string | null
          updated_at?: string
        }
      }
    }
  }
}

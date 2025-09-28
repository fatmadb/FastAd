export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due';
  plan: 'free' | 'pro' | 'enterprise';
  current_period_end: string;
  usage_limit: number;
  current_usage: number;
}

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  prompt: string;
  type: 'image' | 'video' | 'banner' | 'social';
  platform: 'facebook' | 'instagram' | 'youtube' | 'google_ads';
  style: 'realistic' | 'surreal' | 'anime' | 'futuristic';
  output_url: string;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  brand_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url?: string;
  created_at: string;
}

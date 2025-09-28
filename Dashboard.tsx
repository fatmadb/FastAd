import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  FileImage, 
  Video, 
  Download,
  Calendar,
  ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import { ContentItem } from '../../types'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const Dashboard: React.FC = () => {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGenerations: 0,
    thisMonth: 0,
    images: 0,
    videos: 0
  })
  const { subscription, appUser } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: contentData, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      setRecentContent(contentData || [])

      // Calculate stats
      const totalGenerations = contentData?.length || 0
      const thisMonth = contentData?.filter(item => {
        const itemDate = new Date(item.created_at)
        const now = new Date()
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      }).length || 0

      const images = contentData?.filter(item => item.type === 'image').length || 0
      const videos = contentData?.filter(item => item.type === 'video').length || 0

      setStats({ totalGenerations, thisMonth, images, videos })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {appUser?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your content today.
              </p>
            </div>
            <Link
              to="/generate"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New</span>
            </Link>
          </div>

          {/* Subscription Status */}
          <div className="mt-4 p-4 bg-gradient-primary rounded-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  {subscription?.plan === 'free' ? 'Free Plan' : `${subscription?.plan} Plan`}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {subscription?.current_usage || 0} of {subscription?.usage_limit || 10} generations used this month
                </p>
              </div>
              {subscription?.plan === 'free' && (
                <Link
                  to="/pricing"
                  className="bg-white text-primary-blue px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((subscription?.current_usage || 0) / (subscription?.usage_limit || 10)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Generations"
            value={stats.totalGenerations}
            icon={TrendingUp}
            change={12}
            color="bg-blue-500"
          />
          <StatCard
            title="This Month"
            value={stats.thisMonth}
            icon={Calendar}
            change={8}
            color="bg-green-500"
          />
          <StatCard
            title="Images Created"
            value={stats.images}
            icon={FileImage}
            change={15}
            color="bg-purple-500"
          />
          <StatCard
            title="Videos Created"
            value={stats.videos}
            icon={Video}
            change={5}
            color="bg-pink-500"
          />
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link
                to="/library"
                className="text-primary-blue hover:text-primary-purple text-sm font-medium flex items-center"
              >
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentContent.length > 0 ? (
                recentContent.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      {item.type === 'image' ? (
                        <FileImage className="w-6 h-6 text-white" />
                      ) : (
                        <Video className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.type} • {item.platform} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No content generated yet</p>
                  <Link
                    to="/generate"
                    className="btn-primary inline-block mt-3"
                  >
                    Create Your First Project
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/generate?type=social"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-blue hover:bg-blue-50 transition-colors text-center"
              >
                <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Social Media</p>
                <p className="text-xs text-gray-500">Create posts</p>
              </Link>
              <Link
                to="/generate?type=banner"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-blue hover:bg-blue-50 transition-colors text-center"
              >
                <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Banner Ads</p>
                <p className="text-xs text-gray-500">Web banners</p>
              </Link>
              <Link
                to="/generate?type=video"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-blue hover:bg-blue-50 transition-colors text-center"
              >
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Video Ads</p>
                <p className="text-xs text-gray-500">Short videos</p>
              </Link>
              <Link
                to="/brand-kit"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-blue hover:bg-blue-50 transition-colors text-center"
              >
                <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Brand Kit</p>
                <p className="text-xs text-gray-500">Setup branding</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

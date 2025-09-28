import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Rocket, 
  Zap, 
  Palette, 
  BarChart3, 
  Users, 
  CheckCircle,
  Play
} from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Create stunning marketing content in seconds using advanced AI models"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Multiple Styles",
      description: "Choose from realistic, surreal, anime, or futuristic visual styles"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Platform Optimization",
      description: "Auto-sized templates for all major platforms and ad formats"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Work together with your team on marketing campaigns"
    }
  ]

  const platforms = ['Facebook', 'Instagram', 'YouTube', 'Google Ads', 'Twitter', 'LinkedIn']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-blue via-primary-purple to-primary-pink text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Create Marketing Content{' '}
              <span className="gradient-text">10x Faster</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              AI-powered platform for generating banners, social media graphics, 
              product mockups, and video ads from simple text prompts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                <Rocket className="w-5 h-5 mr-2 inline" />
                Start Creating Free
              </Link>
              <button className="flex items-center text-white/90 hover:text-white transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Optimized for Every Platform
            </h2>
            <p className="text-lg text-gray-600">
              Generate content perfectly sized for all major marketing platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {platforms.map((platform) => (
              <motion.div
                key={platform}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-semibold text-gray-700">{platform}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FastAd?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional marketing content 
              without the learning curve
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="text-primary-cyan mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of marketers creating stunning content with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary bg-white text-primary-blue">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

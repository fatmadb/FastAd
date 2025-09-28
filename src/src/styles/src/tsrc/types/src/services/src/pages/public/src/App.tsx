import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/public/Home'
import About from './pages/public/About'
import Pricing from './pages/public/Pricing'
import Blog from './pages/public/Blog'
import BlogPost from './pages/public/BlogPost'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Dashboard from './pages/authenticated/Dashboard'
import Generator from './pages/authenticated/Generator'
import Library from './pages/authenticated/Library'
import BrandKit from './pages/authenticated/BrandKit'
import Settings from './pages/authenticated/Settings'
import Billing from './pages/authenticated/Billing'

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<Generator />} />
              <Route path="/library" element={<Library />} />
              <Route path="/brand-kit" element={<BrandKit />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </MotionConfig>
  )
}

export default App

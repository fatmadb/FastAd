import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../shared/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSubscription?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = false 
}) => {
  const { user, loading, subscription } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireSubscription && subscription?.plan === 'free') {
    return <Navigate to="/pricing" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

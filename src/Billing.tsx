import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Check, 
  Zap, 
  Crown,
  Building,
  ArrowRight,
  Receipt
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

// Mock Stripe integration - in production, use @stripe/stripe-js
const useStripe = () => {
  return {
    redirectToCheckout: async (priceId: string) => {
      // Simulate Stripe checkout
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Redirecting to Stripe checkout for price:', priceId)
          resolve({ error: null })
        }, 1000)
      })
    },
    redirectToCustomerPortal: async () => {
      // Simulate Stripe portal
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Redirecting to Stripe customer portal')
          resolve({ error: null })
        }, 1000)
      })
    }
  }
}

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  icon: React.ComponentType<any>
  stripePriceId: string
}

const Billing: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const { subscription, user } = useAuth()
  const stripe = useStripe()

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '10 AI generations per month',
        'Basic image generation',
        'Standard quality exports',
        '1 Brand Kit',
        'Community support'
      ],
      icon: Zap,
      stripePriceId: 'price_free'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      interval: 'month',
      features: [
        '500 AI generations per month',
        'Advanced image & video generation',
        'High quality exports',
        '5 Brand Kits',
        'Priority support',
        'Commercial license'
      ],
      popular: true,
      icon: Crown,
      stripePriceId: 'price_pro_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited AI generations',
        'Premium image & video generation',
        'Highest quality exports',
        'Unlimited Brand Kits',
        '24/7 dedicated support',
        'White-label options',
        'API access'
      ],
      icon: Building,
      stripePriceId: 'price_enterprise_monthly'
    }
  ]

  useEffect(() => {
    fetchInvoices()
  }, [user])

  const fetchInvoices = async () => {
    if (!user) return

    try {
      // Mock invoices - in production, fetch from Stripe
      const mockInvoices = [
        {
          id: 'inv_1',
          amount: 2900,
          currency: 'usd',
          status: 'paid',
          created: new Date('2024-01-15').getTime(),
          pdfUrl: '#'
        },
        {
          id: 'inv_2',
          amount: 2900,
          currency: 'usd',
          status: 'paid',
          created: new Date('2024-02-15').getTime(),
          pdfUrl: '#'
        }
      ]
      setInvoices(mockInvoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: Plan) => {
    if (!user) return

    setUpdating(true)
    try {
      const { error } = await stripe.redirectToCheckout(plan.stripePriceId)
      
      if (error) {
        throw error
      }

      // In production, this would be handled by webhooks
      await supabase
        .from('subscriptions')
        .update({
          plan: plan.id,
          status: 'active',
          usage_limit: getUsageLimit(plan.id),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Error upgrading plan. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleManageSubscription = async () => {
    setUpdating(true)
    try {
      await stripe.redirectToCustomerPortal()
    } catch (error) {
      console.error('Error managing subscription:', error)
      alert('Error accessing customer portal.')
    } finally {
      setUpdating(false)
    }
  }

  const getUsageLimit = (planId: string) => {
    switch (planId) {
      case 'free': return 10
      case 'pro': return 500
      case 'enterprise': return 1000000 // Essentially unlimited
      default: return 10
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and billing information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
              
              {subscription ? (
                <div className="bg-gradient-primary text-white rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold capitalize">
                        {subscription.plan} Plan
                      </h3>
                      <p className="text-blue-100 mt-1">
                        {subscription.plan === 'free' ? 'Free forever' : `$${plans.find(p => p.id === subscription.plan)?.price}/month`}
                      </p>
                    </div>
                    <div className="bg-white text-primary-blue px-3 py-1 rounded-full text-sm font-semibold">
                      Active
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-blue-100 mb-2">
                      <span>Monthly Usage</span>
                      <span>{subscription.current_usage} / {subscription.usage_limit} generations</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((subscription.current_usage / subscription.usage_limit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {subscription.plan !== 'free' && (
                    <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
                      <div>
                        <p className="text-blue-100 text-sm">
                          Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={handleManageSubscription}
                        disabled={updating}
                        className="bg-white text-primary-blue px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
                      >
                        {updating ? <LoadingSpinner size="sm" /> : 'Manage Subscription'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active subscription</p>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
              
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Receipt className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatPrice(invoice.amount / 100)} • {new Date(invoice.created).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{invoice.status}</p>
                        </div>
                      </div>
                      <a
                        href={invoice.pdfUrl}
                        className="text-primary-blue hover:text-primary-purple font-medium"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No billing history available</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Plans */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upgrade Your Plan</h2>
              
              <div className="space-y-4">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  const isCurrentPlan = subscription?.plan === plan.id
                  const isUpgrade = !subscription || (
                    plans.findIndex(p => p.id === subscription.plan) < plans.findIndex(p => p.id === plan.id)
                  )

                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative border rounded-lg p-4 transition-all duration-200 ${
                        plan.popular
                          ? 'border-primary-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isCurrentPlan ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}

                      {isCurrentPlan && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          plan.popular ? 'text-primary-blue' : 'text-gray-600'
                        }`} />
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <div className="mt-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(plan.price)}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-600">/{plan.interval}</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrentPlan || updating}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                          isCurrentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : plan.popular
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }`}
                      >
                        {isCurrentPlan ? (
                          'Current Plan'
                        ) : isUpgrade ? (
                          <>
                            Upgrade <ArrowRight className="w-4 h-4 ml-2 inline" />
                          </>
                        ) : (
                          'Downgrade'
                        )}
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {/* Enterprise Contact */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Need more?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Custom enterprise solutions with dedicated support and SLAs.
                </p>
                <button className="w-full btn-secondary">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Billing

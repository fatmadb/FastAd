import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Zap, 
  Folder, 
  Palette, 
  Settings, 
  CreditCard,
  BarChart3,
  Users
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate', href: '/generate', icon: Zap },
    { name: 'Projects', href: '/library', icon: Folder },
    { name: 'Brand Kit', href: '/brand-kit', icon: Palette },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold gradient-text">FastAd</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-gradient-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Usage Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Storage Usage</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: '25%' }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">25% of 1GB used</div>
        </div>
      </div>
    </>
  )
}

export default Sidebar

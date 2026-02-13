import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MetaMaskButton from './MetaMaskButton'

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Assets', path: '/assets', icon: '💰' },
    { name: 'News', path: '/news', icon: '📰' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
    { name: 'Portfolio', path: '/portfolio', icon: '💼' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-pulse-primary">Pulse</h1>
                <span className="ml-2 text-xs sm:text-sm text-gray-500 hidden sm:inline">Market Monitoring Engine</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <MetaMaskButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:sticky top-14 sm:top-16 left-0
            w-64 md:w-56 lg:w-64
            bg-white border-r border-gray-200
            h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
            transition-transform duration-300 ease-in-out
            z-30 md:z-auto
            overflow-y-auto
          `}
        >
          <nav className="p-3 sm:p-4">
            <ul className="space-y-1 sm:space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-pulse-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{item.icon}</span>
                      <span className="text-sm sm:text-base">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

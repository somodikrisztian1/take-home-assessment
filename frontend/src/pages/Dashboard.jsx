import { useEffect, useState } from 'react'
import { getDashboard, getPortfolio } from '../services/api'
import { useTheme } from '../context/ThemeContext'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [dashboardResponse, portfolioResponse] = await Promise.all([
          getDashboard(),
          getPortfolio()
        ])
        setDashboardData(dashboardResponse.data.data)
        setPortfolioData(portfolioResponse.data.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      earnings: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      market: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      regulation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      ai: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    }
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-lg shadow animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-4 rounded w-1/3 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-8 rounded w-1/2 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-2/3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <div className={`rounded-lg p-4 sm:p-6 text-center border ${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <span className="text-3xl sm:text-4xl mb-4 block">⚠️</span>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { topGainers, topLosers, recentNews, activeAlerts } = dashboardData

  return (
    <div>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

      {/* Portfolio Summary Card */}
      <div className={`p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>💼 Total Portfolio Value</p>
            <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(portfolioData?.totalValue || 0)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Change</p>
            <p className={`text-xl sm:text-2xl font-bold ${portfolioData?.totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(portfolioData?.totalChange || 0)}
            </p>
            <p className={`text-base sm:text-lg font-semibold ${portfolioData?.totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolioData?.totalChangePercent >= 0 ? '📈' : '📉'} {formatPercentage(portfolioData?.totalChangePercent || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Top Gainers */}
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-2">🚀</span> Top Gainers
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {topGainers?.slice(0, 3).map((asset) => (
              <div key={asset.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</p>
                  <p className={`text-xs sm:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.name}</p>
                </div>
                <div className="text-right ml-2">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-green-500 font-medium text-xs sm:text-base">{formatPercentage(asset.changePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-2">📉</span> Top Losers
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {topLosers?.slice(0, 3).map((asset) => (
              <div key={asset.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</p>
                  <p className={`text-xs sm:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.name}</p>
                </div>
                <div className="text-right ml-2">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-red-500 font-medium text-xs sm:text-base">{formatPercentage(asset.changePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent News & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent News Feed */}
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-2">📰</span> Recent News
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {recentNews?.slice(0, 5).map((news) => (
              <div key={news.id} className={`border-b pb-3 last:border-0 last:pb-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-xs sm:text-sm mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{news.title}</p>
                    <div className={`flex flex-wrap items-center gap-1 sm:gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="truncate max-w-[100px] sm:max-w-none">{news.source}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatTimestamp(news.timestamp)}</span>
                    </div>
                  </div>
                  <span className={`self-start px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-2">🔔</span> Active Alerts
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {activeAlerts?.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`border-l-4 border-pulse-primary p-2 sm:p-3 rounded-r-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <p className={`text-xs sm:text-sm line-clamp-2 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{alert.message}</p>
                  <span className={`self-start px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className={`text-xs mt-1 sm:mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatTimestamp(alert.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

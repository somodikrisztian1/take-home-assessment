import { useEffect, useState } from 'react'
import { getDashboard, getPortfolio } from '../services/api'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      earnings: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      crypto: 'bg-orange-100 text-orange-800',
      market: 'bg-green-100 text-green-800',
      regulation: 'bg-red-100 text-red-800',
      ai: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Portfolio Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">💼 Total Portfolio Value</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(portfolioData?.totalValue || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Change</p>
            <p className={`text-2xl font-bold ${portfolioData?.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolioData?.totalChange || 0)}
            </p>
            <p className={`text-lg font-semibold ${portfolioData?.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioData?.totalChangePercent >= 0 ? '📈' : '📉'} {formatPercentage(portfolioData?.totalChangePercent || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Gainers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🚀</span> Top Gainers
          </h2>
          <div className="space-y-3">
            {topGainers?.slice(0, 3).map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{asset.symbol}</p>
                  <p className="text-sm text-gray-500">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-green-600 font-medium">{formatPercentage(asset.changePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📉</span> Top Losers
          </h2>
          <div className="space-y-3">
            {topLosers?.slice(0, 3).map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{asset.symbol}</p>
                  <p className="text-sm text-gray-500">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(asset.currentPrice)}</p>
                  <p className="text-red-600 font-medium">{formatPercentage(asset.changePercent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent News & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News Feed */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📰</span> Recent News
          </h2>
          <div className="space-y-4">
            {recentNews?.slice(0, 5).map((news) => (
              <div key={news.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{news.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{formatTimestamp(news.timestamp)}</span>
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🔔</span> Active Alerts
          </h2>
          <div className="space-y-3">
            {activeAlerts?.slice(0, 5).map((alert) => (
              <div key={alert.id} className="border-l-4 border-pulse-primary bg-gray-50 p-3 rounded-r-lg">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-700 line-clamp-2 flex-1">{alert.message}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{formatTimestamp(alert.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

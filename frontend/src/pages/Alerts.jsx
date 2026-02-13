import { useEffect, useState } from 'react'
import { getAlerts } from '../services/api'
import { useTheme } from '../context/ThemeContext'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'list'
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const response = await getAlerts()
        setAlerts(response.data.data)
      } catch (err) {
        console.error('Error fetching alerts:', err)
        setError('Failed to load alerts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = Math.floor((now - date) / 1000) // seconds

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const severityOrder = ['critical', 'high', 'medium', 'low']

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          border: 'border-l-red-500',
          bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
          icon: '🚨'
        }
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          border: 'border-l-orange-500',
          bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50',
          icon: '⚠️'
        }
      case 'medium':
        return {
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          border: 'border-l-yellow-500',
          bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
          icon: '📋'
        }
      case 'low':
        return {
          badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          border: 'border-l-green-500',
          bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
          icon: 'ℹ️'
        }
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          border: 'border-l-gray-500',
          bg: darkMode ? 'bg-gray-800' : 'bg-gray-50',
          icon: '📌'
        }
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      market_volatility: '📊',
      correlation_breakdown: '🔀',
      liquidity_event: '💧',
      sector_rotation: '🔄',
      macro_regime: '🌐',
      price_threshold: '💰',
      volume_surge: '📈',
      news_event: '📰',
      technical_pattern: '📉',
      ai_core_prediction: '🤖',
      regulatory_news: '⚖️',
      network_activity: '🌐',
      defi_activity: '🔗'
    }
    return icons[type] || '🔔'
  }

  const filteredAlerts = severityFilter === 'all'
    ? alerts
    : alerts.filter(alert => alert.severity === severityFilter)

  const groupedAlerts = severityOrder.reduce((acc, severity) => {
    acc[severity] = filteredAlerts.filter(alert => alert.severity === severity)
    return acc
  }, {})

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length
  }

  if (loading) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alerts</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-lg shadow animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-5 rounded w-1/2 mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-full mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alerts</h1>
        <div className={`rounded-lg p-4 sm:p-6 text-center ${darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <span className="text-3xl sm:text-4xl mb-4 block">⚠️</span>
          <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
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

  const renderAlert = (alert) => {
    const colors = getSeverityColor(alert.severity)
    return (
      <div
        key={alert.id}
        className={`p-4 rounded-lg border-l-4 ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(alert.type)}</span>
            <h3 className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {alert.title || alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors.badge}`}>
              {alert.severity}
            </span>
            {alert.actionRequired && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-pulse-primary text-white">
                Action Required
              </span>
            )}
          </div>
        </div>

        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {alert.message}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>{getTimeAgo(alert.timestamp)}</span>
            <span>•</span>
            <span>{formatTimestamp(alert.timestamp)}</span>
            {alert.aiCoreAccuracy && (
              <>
                <span>•</span>
                <span className="text-pulse-primary">🤖 AI Confidence: {(alert.aiCoreAccuracy * 100).toFixed(0)}%</span>
              </>
            )}
          </div>

          {alert.affectedAssets && (
            <div className="flex gap-1 flex-wrap">
              {alert.affectedAssets.slice(0, 4).map((asset) => (
                <span
                  key={asset}
                  className={`px-2 py-0.5 rounded text-xs ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                  }`}
                >
                  {asset}
                </span>
              ))}
              {alert.affectedAssets.length > 4 && (
                <span className={`px-2 py-0.5 rounded text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-500'
                }`}>
                  +{alert.affectedAssets.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alerts</h1>

        {/* View Mode Toggle */}
        <div className={`flex items-center gap-2 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'grouped'
                ? 'bg-pulse-primary text-white'
                : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Grouped
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-pulse-primary text-white'
                : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { key: 'all', label: 'All', icon: '🔔' },
          { key: 'critical', label: 'Critical', icon: '🚨' },
          { key: 'high', label: 'High', icon: '⚠️' },
          { key: 'medium', label: 'Medium', icon: '📋' },
          { key: 'low', label: 'Low', icon: 'ℹ️' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setSeverityFilter(key)}
            className={`p-3 sm:p-4 rounded-lg transition-all ${
              severityFilter === key
                ? 'ring-2 ring-pulse-primary'
                : ''
            } ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow`}
          >
            <div className="text-lg sm:text-xl mb-1">{icon}</div>
            <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {alertCounts[key]}
            </div>
            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Alerts Display */}
      {viewMode === 'grouped' ? (
        <div className="space-y-6">
          {severityOrder.map((severity) => {
            const alertsInGroup = groupedAlerts[severity]
            if (alertsInGroup.length === 0) return null

            const colors = getSeverityColor(severity)
            return (
              <div key={severity}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{colors.icon}</span>
                  <h2 className={`text-lg font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {severity} Priority
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                    {alertsInGroup.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {alertsInGroup.map(renderAlert)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className={`p-6 rounded-lg shadow text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              No alerts found
            </div>
          ) : (
            filteredAlerts
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(renderAlert)
          )}
        </div>
      )}
    </div>
  )
}

export default Alerts

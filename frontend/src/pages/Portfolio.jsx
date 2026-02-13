import { useEffect, useState } from 'react'
import { getPortfolio, getStocks, getCrypto } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [chartType, setChartType] = useState('area') // 'area' or 'line'
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [portfolioRes, stocksRes, cryptoRes] = await Promise.all([
          getPortfolio(),
          getStocks(),
          getCrypto()
        ])
        setPortfolio(portfolioRes.data.data)
        setAssets([...stocksRes.data.data, ...cryptoRes.data.data])
      } catch (err) {
        console.error('Error fetching portfolio:', err)
        setError('Failed to load portfolio. Please try again later.')
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

  // Generate portfolio value history from holdings
  const generatePortfolioHistory = () => {
    if (!portfolio?.assets || !assets.length) return []

    // Use the price history of the first asset to get timestamps
    const firstAssetWithHistory = assets.find(a =>
      portfolio.assets.some(pa => pa.assetId === a.symbol) && a.priceHistory?.length
    )

    if (!firstAssetWithHistory) return []

    return firstAssetWithHistory.priceHistory.map((_, idx) => {
      let totalValue = 0

      portfolio.assets.forEach(holding => {
        const assetData = assets.find(a => a.symbol === holding.assetId)
        if (assetData?.priceHistory?.[idx]) {
          totalValue += assetData.priceHistory[idx].price * holding.quantity
        }
      })

      const date = new Date(firstAssetWithHistory.priceHistory[idx].timestamp)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: totalValue
      }
    })
  }

  // Calculate allocation data for pie chart
  const getAllocationData = () => {
    if (!portfolio?.assets) return []

    return portfolio.assets.map(holding => ({
      name: holding.assetId,
      value: holding.value,
      percentage: ((holding.value / portfolio.totalValue) * 100).toFixed(1)
    }))
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ef4444']

  const portfolioHistory = generatePortfolioHistory()
  const allocationData = getAllocationData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-lg font-bold text-pulse-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-lg shadow animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-5 rounded w-1/3 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</h1>
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

  return (
    <div>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            💼 Total Value
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(portfolio?.totalValue || 0)}
          </p>
        </div>
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            📈 Total P&L
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${portfolio?.totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(portfolio?.totalChange || 0)}
          </p>
        </div>
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            📊 Return
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${portfolio?.totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(portfolio?.totalChangePercent || 0)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Portfolio Value Chart */}
        <div className={`lg:col-span-2 p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📈 Portfolio Value Over Time
            </h2>
            <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-pulse-primary text-white'
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-pulse-primary text-white'
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Line
              </button>
            </div>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={portfolioHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className={`p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🥧 Allocation
          </h2>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    color: darkMode ? '#ffffff' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Holdings
          </h2>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {portfolio?.assets?.map((holding) => {
            const assetData = assets.find(a => a.symbol === holding.assetId)
            return (
              <div
                key={holding.assetId}
                onClick={() => setSelectedAsset(selectedAsset?.assetId === holding.assetId ? null : { ...holding, ...assetData })}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {holding.assetId}
                    </span>
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      × {holding.quantity}
                    </span>
                  </div>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(holding.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Avg: {formatCurrency(holding.avgBuyPrice)}
                  </span>
                  <span className={holding.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(holding.changePercent)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Asset
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Quantity
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Avg Price
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Current Price
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Value
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  P&L
                </th>
                <th className={`px-4 lg:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Return
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {portfolio?.assets?.map((holding) => {
                const assetData = assets.find(a => a.symbol === holding.assetId)
                return (
                  <tr
                    key={holding.assetId}
                    onClick={() => setSelectedAsset(selectedAsset?.assetId === holding.assetId ? null : { ...holding, ...assetData })}
                    className={`cursor-pointer transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {holding.assetId}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ['BTC', 'ETH', 'SOL', 'XRP', 'AVAX'].includes(holding.assetId)
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {['BTC', 'ETH', 'SOL', 'XRP', 'AVAX'].includes(holding.assetId) ? 'Crypto' : 'Stock'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {holding.quantity}
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatCurrency(holding.avgBuyPrice)}
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(holding.value)}
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right font-medium ${
                      holding.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(holding.change)}
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right font-medium ${
                      holding.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(holding.changePercent)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Watchlist */}
      {portfolio?.watchlist && (
        <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            👁️ Watchlist
          </h2>
          <div className="flex flex-wrap gap-2">
            {portfolio.watchlist.map((symbol) => {
              const assetData = assets.find(a => a.symbol === symbol)
              return (
                <div
                  key={symbol}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {symbol}
                  </span>
                  {assetData && (
                    <span className={assetData.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatPercentage(assetData.changePercent)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className={`rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAsset.assetId}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedAsset.name || 'Asset Details'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className={`p-2 text-xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Position Value</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(selectedAsset.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>P&L</p>
                  <p className={`text-lg font-bold ${selectedAsset.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(selectedAsset.change)} ({formatPercentage(selectedAsset.changePercent)})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantity</p>
                  <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAsset.quantity}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Price</p>
                  <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(selectedAsset.avgBuyPrice)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</p>
                  <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(selectedAsset.currentPrice)}
                  </p>
                </div>
              </div>

              {selectedAsset.description && (
                <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notes</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedAsset.description}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedAsset(null)}
                className="w-full py-2.5 sm:py-3 bg-pulse-primary text-white rounded-lg font-medium hover:bg-pulse-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio

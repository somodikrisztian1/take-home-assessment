import { useEffect, useState } from 'react'
import { getStocks, getCrypto } from '../services/api'
import { useTheme } from '../context/ThemeContext'

const Assets = () => {
  const [assets, setAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, stocks, crypto
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' })
  const [selectedAsset, setSelectedAsset] = useState(null)
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stocksResponse, cryptoResponse] = await Promise.all([
          getStocks(),
          getCrypto()
        ])

        const stocks = stocksResponse.data.data.map(s => ({ ...s, type: 'stock' }))
        const crypto = cryptoResponse.data.data.map(c => ({ ...c, type: 'crypto' }))

        const allAssets = [...stocks, ...crypto]
        setAssets(allAssets)
        setFilteredAssets(allAssets)
      } catch (err) {
        console.error('Error fetching assets:', err)
        setError('Failed to load assets. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = [...assets]

    // Apply filter
    if (filter === 'stocks') {
      result = result.filter(asset => asset.type === 'stock')
    } else if (filter === 'crypto') {
      result = result.filter(asset => asset.type === 'crypto')
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        asset =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredAssets(result)
  }, [assets, filter, searchQuery, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

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

  const formatVolume = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toString()
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assets</h1>
        <div className={`rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-4 sm:p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex items-center gap-4 py-3 sm:py-4 animate-pulse border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className={`h-4 rounded w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-4 rounded w-24 sm:w-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-4 rounded w-20 sm:w-24 ml-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assets</h1>
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

  return (
    <div>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assets</h1>

      {/* Filters and Search */}
      <div className={`p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pulse-primary text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({assets.length})
            </button>
            <button
              onClick={() => setFilter('stocks')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'stocks'
                  ? 'bg-pulse-primary text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Stocks ({assets.filter(a => a.type === 'stock').length})
            </button>
            <button
              onClick={() => setFilter('crypto')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'crypto'
                  ? 'bg-pulse-primary text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🪙 Crypto ({assets.filter(a => a.type === 'crypto').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full">
            <input
              type="text"
              placeholder="🔍 Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-primary ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Assets - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredAssets.length === 0 ? (
          <div className={`rounded-lg shadow p-6 text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
            No assets found matching your criteria
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
              className={`rounded-lg shadow p-4 cursor-pointer transition-shadow hover:shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        asset.type === 'stock'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}
                    >
                      {asset.type === 'stock' ? '📈' : '🪙'}
                    </span>
                  </div>
                  <p className={`text-sm truncate max-w-[200px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(asset.currentPrice)}</p>
                  <p
                    className={`text-sm font-medium ${
                      asset.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formatPercentage(asset.changePercent)}
                  </p>
                </div>
              </div>
              <div className={`flex justify-between text-xs pt-2 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                <span>Volume: {formatVolume(asset.volume)}</span>
                <span>Tap for details →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assets Table - Desktop */}
      <div className={`hidden md:block rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th
                  onClick={() => handleSort('symbol')}
                  className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Symbol {getSortIcon('symbol')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Name {getSortIcon('name')}
                </th>
                <th
                  onClick={() => handleSort('currentPrice')}
                  className={`px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Price {getSortIcon('currentPrice')}
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className={`px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Change {getSortIcon('changePercent')}
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className={`hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Volume {getSortIcon('volume')}
                </th>
                <th className={`px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Type
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`px-4 lg:px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No assets found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                    className={`cursor-pointer transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className={`text-sm truncate block max-w-[150px] lg:max-w-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{asset.name}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right whitespace-nowrap">
                      <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(asset.currentPrice)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right whitespace-nowrap">
                      <span
                        className={`font-medium text-sm ${
                          asset.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {formatPercentage(asset.changePercent)}
                      </span>
                    </td>
                    <td className={`hidden lg:table-cell px-4 lg:px-6 py-3 lg:py-4 text-right whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatVolume(asset.volume)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          asset.type === 'stock'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {asset.type === 'stock' ? '📈 Stock' : '🪙 Crypto'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className={`rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.symbol}</h2>
                  <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedAsset.name}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className={`text-xl sm:text-2xl p-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Price</p>
                    <p className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(selectedAsset.currentPrice)}
                    </p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Change</p>
                    <p
                      className={`text-lg sm:text-xl font-bold ${
                        selectedAsset.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {formatPercentage(selectedAsset.changePercent)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volume</p>
                    <p className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatVolume(selectedAsset.volume)}
                    </p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</p>
                    <p className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAsset.marketCap
                        ? formatVolume(selectedAsset.marketCap)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedAsset.sector && (
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sector</p>
                    <p className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.sector}</p>
                  </div>
                )}

                {selectedAsset.description && (
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Description</p>
                    <p className={`text-xs sm:text-sm line-clamp-4 sm:line-clamp-none ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedAsset.description}</p>
                  </div>
                )}

                {selectedAsset.keyMetrics && (
                  <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs sm:text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Key Metrics</p>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>P/E Ratio:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.keyMetrics.peRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>EPS:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${selectedAsset.keyMetrics.eps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Div Yield:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.keyMetrics.dividendYield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Beta:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedAsset.keyMetrics.beta}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-pulse-primary text-white rounded-lg font-medium hover:bg-pulse-secondary transition-colors text-sm sm:text-base"
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

export default Assets

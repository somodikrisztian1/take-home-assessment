import { useEffect, useState } from 'react'
import { getStocks, getCrypto } from '../services/api'

const Assets = () => {
  const [assets, setAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, stocks, crypto
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' })
  const [selectedAsset, setSelectedAsset] = useState(null)

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
        <h1 className="text-3xl font-bold mb-6">Assets</h1>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 animate-pulse border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
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
        <h1 className="text-3xl font-bold mb-6">Assets</h1>
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Assets</h1>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pulse-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({assets.length})
            </button>
            <button
              onClick={() => setFilter('stocks')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'stocks'
                  ? 'bg-pulse-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Stocks ({assets.filter(a => a.type === 'stock').length})
            </button>
            <button
              onClick={() => setFilter('crypto')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'crypto'
                  ? 'bg-pulse-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🪙 Crypto ({assets.filter(a => a.type === 'crypto').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('symbol')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Symbol {getSortIcon('symbol')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Name {getSortIcon('name')}
                </th>
                <th
                  onClick={() => handleSort('currentPrice')}
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Price {getSortIcon('currentPrice')}
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Change {getSortIcon('changePercent')}
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Volume {getSortIcon('volume')}
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No assets found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{asset.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{asset.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(asset.currentPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(asset.changePercent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-gray-500">{formatVolume(asset.volume)}</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          asset.type === 'stock'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAsset.symbol}</h2>
                  <p className="text-gray-500">{selectedAsset.name}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Current Price</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedAsset.currentPrice)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Change</p>
                    <p
                      className={`text-xl font-bold ${
                        selectedAsset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(selectedAsset.changePercent)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Volume</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatVolume(selectedAsset.volume)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Market Cap</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedAsset.marketCap
                        ? formatVolume(selectedAsset.marketCap)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedAsset.sector && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Sector</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedAsset.sector}</p>
                  </div>
                )}

                {selectedAsset.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-sm text-gray-700">{selectedAsset.description}</p>
                  </div>
                )}

                {selectedAsset.keyMetrics && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Key Metrics</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">P/E Ratio:</span>
                        <span className="font-medium">{selectedAsset.keyMetrics.peRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">EPS:</span>
                        <span className="font-medium">${selectedAsset.keyMetrics.eps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dividend Yield:</span>
                        <span className="font-medium">{selectedAsset.keyMetrics.dividendYield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Beta:</span>
                        <span className="font-medium">{selectedAsset.keyMetrics.beta}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="mt-6 w-full py-3 bg-pulse-primary text-white rounded-lg font-medium hover:bg-pulse-secondary transition-colors"
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

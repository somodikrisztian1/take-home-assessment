import { useEffect, useState } from 'react'
import { getNews } from '../services/api'
import { useTheme } from '../context/ThemeContext'

const News = () => {
  const [news, setNews] = useState([])
  const [filteredNews, setFilteredNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await getNews()
        setNews(response.data.data)
        setFilteredNews(response.data.data)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError('Failed to load news. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    let result = [...news]

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(article => article.category === categoryFilter)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          article.summary?.toLowerCase().includes(query)
      )
    }

    setFilteredNews(result)
  }, [news, categoryFilter, searchQuery])

  const categories = [...new Set(news.map(article => article.category))]

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImpactColor = (impact) => {
    switch (impact) {
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
      regulatory: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      macro: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    }
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const getSentimentIcon = (sentiment) => {
    if (sentiment >= 0.7) return '📈'
    if (sentiment >= 0.5) return '➡️'
    return '📉'
  }

  if (loading) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>News</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-lg shadow animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-5 rounded w-3/4 mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-1/2 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 rounded w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>News</h1>
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
      <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>News</h1>

      {/* Filters */}
      <div className={`p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-pulse-primary text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({news.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  categoryFilter === category
                    ? 'bg-pulse-primary text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({news.filter(n => n.category === category).length})
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search news..."
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

      {/* News List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredNews.length === 0 ? (
          <div className={`p-6 rounded-lg shadow text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
            No news found matching your criteria
          </div>
        ) : (
          filteredNews.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className={`p-4 sm:p-6 rounded-lg shadow cursor-pointer transition-all hover:shadow-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className={`font-semibold text-base sm:text-lg flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(article.impact)}`}>
                    {article.impact}
                  </span>
                </div>
              </div>

              <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {article.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">{article.source}</span>
                  <span>•</span>
                  <span>{formatTimestamp(article.timestamp)}</span>
                  <span>•</span>
                  <span>{getSentimentIcon(article.sentiment)} Sentiment: {(article.sentiment * 100).toFixed(0)}%</span>
                </div>

                {article.affectedAssets && (
                  <div className="flex gap-1 flex-wrap">
                    {article.affectedAssets.slice(0, 4).map((asset) => (
                      <span
                        key={asset}
                        className={`px-2 py-0.5 rounded text-xs ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className={`rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(selectedArticle.category)}`}>
                    {selectedArticle.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(selectedArticle.impact)}`}>
                    {selectedArticle.impact} impact
                  </span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className={`p-2 text-xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ✕
                </button>
              </div>

              <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedArticle.title}
              </h2>

              <div className={`flex items-center gap-2 text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">{selectedArticle.source}</span>
                <span>•</span>
                <span>{formatTimestamp(selectedArticle.timestamp)}</span>
              </div>

              <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedArticle.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment</p>
                  <p className={`text-lg font-bold ${
                    selectedArticle.sentiment >= 0.7
                      ? 'text-green-500'
                      : selectedArticle.sentiment >= 0.5
                        ? darkMode ? 'text-gray-300' : 'text-gray-700'
                        : 'text-red-500'
                  }`}>
                    {getSentimentIcon(selectedArticle.sentiment)} {(selectedArticle.sentiment * 100).toFixed(0)}%
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Affected Assets</p>
                  <div className="flex gap-1 flex-wrap">
                    {selectedArticle.affectedAssets?.map((asset) => (
                      <span
                        key={asset}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedArticle.tags && (
                <div className="mb-4">
                  <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs ${
                          darkMode ? 'bg-pulse-primary/30 text-pulse-light' : 'bg-pulse-light text-pulse-primary'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedArticle(null)}
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

export default News

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getDashboard, getStocks, getCrypto, getPortfolio, getNews, getAlerts } from '../services/api'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

const POLLING_INTERVAL = 30000 // 30 seconds

export const DataProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null)
  const [stocks, setStocks] = useState([])
  const [crypto, setCrypto] = useState([])
  const [portfolio, setPortfolio] = useState(null)
  const [news, setNews] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchAllData = useCallback(async () => {
    try {
      const [
        dashboardRes,
        stocksRes,
        cryptoRes,
        portfolioRes,
        newsRes,
        alertsRes
      ] = await Promise.all([
        getDashboard(),
        getStocks(),
        getCrypto(),
        getPortfolio(),
        getNews(),
        getAlerts()
      ])

      setDashboard(dashboardRes.data.data)
      setStocks(stocksRes.data.data)
      setCrypto(cryptoRes.data.data)
      setPortfolio(portfolioRes.data.data)
      setNews(newsRes.data.data)
      setAlerts(alertsRes.data.data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData()
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchAllData])

  const refreshData = () => {
    setLoading(true)
    fetchAllData()
  }

  return (
    <DataContext.Provider value={{
      dashboard,
      stocks,
      crypto,
      portfolio,
      news,
      alerts,
      loading,
      error,
      lastUpdated,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext

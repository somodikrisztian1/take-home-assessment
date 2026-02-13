import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './context/DataContext'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import News from './pages/News'
import Alerts from './pages/Alerts'
import Portfolio from './pages/Portfolio'
import Layout from './components/Layout'

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/news" element={<News />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App

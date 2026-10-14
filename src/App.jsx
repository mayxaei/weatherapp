
import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import Map from './components/Map'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Statistics from './components/Statistics'
import SettingsPage from './components/SettingsPage'

const SETTINGS_URL = 'https://localhost:7039/Settings'

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

const applyTheme = (theme) => {
  document.documentElement.dataset.themePreference = theme
  document.documentElement.dataset.theme =
    theme === 'system' ? getSystemTheme() : theme
}

function ThemeManager() {
  const location = useLocation()

  const loadTheme = useCallback(async () => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      applyTheme('system')
      return
    }

    try {
      const response = await fetch(SETTINGS_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) return

      const settings = await response.json()
      applyTheme(
        ['light', 'dark', 'system'].includes(settings.theme)
          ? settings.theme
          : 'system'
      )
    } catch (error) {
      console.error('Nie udało się pobrać motywu:', error)
    }
  }, [])

  useEffect(() => {
    loadTheme()

    const handleSettingsUpdate = () => loadTheme()

    const colorScheme = window.matchMedia('(prefers-color-scheme: light)')

    const handleSystemThemeChange = () => {
      if (
        !sessionStorage.getItem('token') ||
        document.documentElement.dataset.themePreference === 'system'
      ) {
        applyTheme('system')
      }
    }

    window.addEventListener('weatherapp-settings-updated', handleSettingsUpdate)
    colorScheme.addEventListener('change', handleSystemThemeChange)

    return () => {
      window.removeEventListener('weatherapp-settings-updated', handleSettingsUpdate)
      colorScheme.removeEventListener('change', handleSystemThemeChange)
    }
  }, [loadTheme, location.pathname])

  return null
}

function HomePage() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user')

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        sessionStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    applyTheme('system')
    setUser(null)
    navigate('/')
  }

  return (
    <main className="weather-app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">☀️</div>
          <div>
            <h1>WeatherApp</h1>
            <p>Sprawdź aktualną pogodę i historię temperatur</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-badge">
            <span className="status-dot"></span>
            Dane pogodowe na żywo
          </div>

          {sessionStorage.getItem('token') && (
            <Link to="/statistics" className="statistics-link">
              Statystyki
            </Link>
          )}

          {user ? (
            <>
              <Link to="/settings" className="logged-user">
                {user.username}
              </Link>
              <button
                type="button"
                className="login-toggle"
                onClick={handleLogout}
              >
                Wyloguj się
              </button>
            </>
          ) : (
            <Link to="/login" className="login-toggle">
              Zaloguj się
            </Link>
          )}
        </div>
      </header>

      <section className="welcome-section">
        <h2>Sprawdź pogodę</h2>
        <p className="welcome-description">
          Aktualne warunki pogodowe, interaktywna mapa
          oraz dane historyczne
        </p>
      </section>

      <section className="weather-section">
        <div className="section-heading">
          <div>
            <h2>Mapa i historia pogody</h2>
          </div>
        </div>

        <div className="weather-panel">
          <Map key={user ? (user.id ?? user.username) : 'guest'} />
        </div>
      </section>

      <footer className="app-footer">
        WeatherApp · Open-Meteo · OpenStreetMap
      </footer>
    </main>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <ThemeManager />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
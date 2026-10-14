
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './SettingsPage.css'

const SETTINGS_URL = 'https://localhost:7039/Settings'

const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

const applyTheme = (theme) => {
    document.documentElement.dataset.themePreference = theme
    document.documentElement.dataset.theme =
        theme === 'system' ? getSystemTheme() : theme
}

function SettingsPage() {
    const navigate = useNavigate()

    const [settings, setSettings] = useState({
        temperatureUnit: 'C',
        windSpeedUnit: 'kmh',
        theme: 'system'
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const token = sessionStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        fetch(SETTINGS_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async response => {
                const text = await response.text()
                const data = text ? JSON.parse(text) : null

                if (!response.ok) {
                    throw new Error(
                        typeof data === 'string'
                            ? data
                            : 'Nie udało się pobrać ustawień.'
                    )
                }

                if (data) {
                    const loadedSettings = {
                        ...data,
                        theme: ['light', 'dark', 'system'].includes(data.theme)
                            ? data.theme
                            : 'system'
                    }

                    setSettings(loadedSettings)
                    applyTheme(loadedSettings.theme)
                }
            })
            .catch(error => setError(error.message))
            .finally(() => setLoading(false))
    }, [navigate])

    const handleChange = (event) => {
        const { name, value } = event.target

        setSettings(previous => ({
            ...previous,
            [name]: value
        }))

        if (name === 'theme') {
            applyTheme(value)
        }

        setSuccess('')
        setError('')
    }

    const handleSave = async (event) => {
        event.preventDefault()

        const token = sessionStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(SETTINGS_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            })

            const text = await response.text()
            const data = text ? JSON.parse(text) : null

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Nie udało się zapisać ustawień.'
                )
            }

            applyTheme(settings.theme)

            window.dispatchEvent(
                new Event('weatherapp-settings-updated')
            )

            setSuccess('Ustawienia zostały zapisane.')
        } catch (error) {
            setError(error.message || 'Błąd połączenia z serwerem.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="settings-page">Ładowanie ustawień...</div>
    }

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Ustawienia</h1>

                <p className="settings-description">
                    Dostosuj WeatherApp do swoich preferencji.
                </p>

                <form onSubmit={handleSave} className="settings-form">
                    <div className="settings-field">
                        <label htmlFor="temperatureUnit">
                            Jednostka temperatury
                        </label>

                        <select
                            id="temperatureUnit"
                            name="temperatureUnit"
                            value={settings.temperatureUnit}
                            onChange={handleChange}
                        >
                            <option value="C">Stopnie Celsjusza (°C)</option>
                            <option value="F">Stopnie Fahrenheita (°F)</option>
                        </select>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="windSpeedUnit">
                            Jednostka prędkości wiatru
                        </label>

                        <select
                            id="windSpeedUnit"
                            name="windSpeedUnit"
                            value={settings.windSpeedUnit}
                            onChange={handleChange}
                        >
                            <option value="kmh">Kilometry na godzinę (km/h)</option>
                            <option value="ms">Metry na sekundę (m/s)</option>
                        </select>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="theme">Motyw aplikacji</label>

                        <select
                            id="theme"
                            name="theme"
                            value={settings.theme}
                            onChange={handleChange}
                        >
                            <option value="system">Zgodny z systemem</option>
                            <option value="dark">Ciemny</option>
                            <option value="light">Jasny</option>
                        </select>
                    </div>

                    {error && (
                        <p className="settings-error">{error}</p>
                    )}

                    {success && (
                        <p className="settings-success">{success}</p>
                    )}

                    <button type="submit" disabled={saving}>
                        {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
                    </button>
                </form>

                <Link to="/" className="settings-back">
                    ← Wróć do strony głównej
                </Link>
            </div>
        </div>
    )
}

export default SettingsPage
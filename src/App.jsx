import './App.css'
import Map from './components/Map'

function App() {
  return (
    <main className="weather-app">

      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            ☀️
          </div>

          <div>
            <h1>WeatherApp</h1>
            <p>Sprawdź aktualną pogodę i historię temperatur</p>
          </div>
        </div>

        <div className="header-badge">
          <span className="status-dot"></span>
          Dane pogodowe na żywo
        </div>
      </header>


      <section className="welcome-section">
        <h2>
          Sprawdź pogodę
        </h2>
        <p className="welcome-description">
          Aktualne warunki pogodowe, interaktywna mapa
          oraz dane historyczne
        </p>
      </section>

      <section className="weather-section">
        <div className="section-heading">
          <div>
            <h2>
              Mapa i historia pogody
            </h2>
          </div>
        </div>

        <div className="weather-panel">
          <Map />
        </div>
      </section>

      <footer className="app-footer">
        WeatherApp · Open-Meteo · OpenStreetMap
      </footer>

    </main>
  )
}

export default App
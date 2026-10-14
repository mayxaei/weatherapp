
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Statistics.css';

function Statistics() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedCity, setExpandedCity] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        fetch('https://localhost:7039/Statistics', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('token');
                    navigate('/login', { replace: true });
                    throw new Error('Sesja wygasła. Zaloguj się ponownie.');
                }

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać statystyk.');
                }

                return response.json();
            })
            .then(data => setStatistics(data))
            .catch(error => {
                if (error.name !== 'AbortError') {
                    setError(error.message || 'Nie udało się pobrać statystyk.');
                }
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (!sessionStorage.getItem('token')) {
        return null;
    }

    if (loading) {
        return (
            <div className="statistics-page">
                <p>Ładowanie statystyk...</p>
            </div>
        );
    }

    if (error || !statistics) {
        return (
            <main className="statistics-page">
                <Link to="/" className="statistics-back-link">
                    ← Powrót do strony głównej
                </Link>
                <p className="statistics-error">
                    {error || 'Nie udało się pobrać statystyk.'}
                </p>
            </main>
        );
    }

    return (
        <main className="statistics-page">
            <Link to="/" className="statistics-back-link">
                ← Powrót do strony głównej
            </Link>

            <header className="statistics-header">
                <span className="statistics-label">WEATHERAPP</span>
                <h1>Statystyki społeczności</h1>
                <p>Sprawdź, z jakich lokalizacji korzystają użytkownicy aplikacji.</p>
            </header>

            <section className="statistics-cards">
                <article className="statistics-card">
                    <span>Użytkownicy</span>
                    <strong>{statistics.totalUsers}</strong>
                </article>
                <article className="statistics-card">
                    <span>Zapisane lokalizacje</span>
                    <strong>{statistics.totalLocations}</strong>
                </article>
                <article className="statistics-card">
                    <span>Unikalne miasta</span>
                    <strong>{statistics.uniqueCities}</strong>
                </article>
            </section>

            <section className="statistics-section">
                <h2>Najpopularniejsze miasta</h2>

                {statistics.popularCities.length === 0 ? (
                    <p>Nie ma jeszcze zapisanych lokalizacji.</p>
                ) : (
                    <div className="statistics-list">
                        {statistics.popularCities.map((city, index) => (
                            <div className="statistics-city-item" key={city.name}>
                                <button
                                    type="button"
                                    className="statistics-row statistics-city-button"
                                    onClick={() => setExpandedCity(
                                        expandedCity === city.name ? null : city.name
                                    )}
                                    aria-expanded={expandedCity === city.name}
                                >
                                    <span className="statistics-rank">{index + 1}</span>
                                    <span className="statistics-city-name">{city.name}</span>
                                    <span className="statistics-count">
                                        {city.count}{' '}
                                        {city.count === 1
                                            ? 'zapis'
                                            : city.count < 5
                                                ? 'zapisy'
                                                : 'zapisów'}
                                    </span>
                                    <span className="statistics-chevron">
                                        {expandedCity === city.name ? '▲' : '▼'}
                                    </span>
                                </button>

                                {expandedCity === city.name && (
                                    <div className="statistics-city-users">
                                        <strong>Zapisali to miasto:</strong>
                                        {city.users.length > 0 ? (
                                            <div className="statistics-user-list">
                                                {city.users.map(username => (
                                                    <span
                                                        className="statistics-user"
                                                        key={username}
                                                    >
                                                        {username}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Brak użytkowników.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="statistics-section">
                <h2>Ostatnio zapisane lokalizacje</h2>

                {statistics.recentLocations.length === 0 ? (
                    <p>Nie ma jeszcze zapisanych lokalizacji.</p>
                ) : (
                    <div className="statistics-list">
                        {statistics.recentLocations.map((location, index) => (
                            <article
                                className="statistics-row recent-location"
                                key={`${location.name}-${location.createdAt}-${index}`}
                            >
                                <div className="recent-location-info">
                                    <strong>{location.name}</strong>
                                    {location.address && <span>{location.address}</span>}
                                </div>
                                <time>
                                    {new Date(location.createdAt).toLocaleDateString('pl-PL')}
                                </time>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Statistics;

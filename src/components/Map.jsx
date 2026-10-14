import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import Button from './Button';
import CitySearch from './CitySearch';
import LocationMarker from './LocationMarker';
import MapViewUpdater from './MapViewUpdater';
import TemperatureChart from './TemperatureChart';
import { useWeatherLogic } from './MapLogic';
import SavedCharts from './SavedCharts';

const API_URL = 'https://localhost:7039/WeatherCharts';
const SETTINGS_URL = 'https://localhost:7039/Settings';

const formatDate = date => String(date ?? '').slice(0, 10);

async function readResponse(response) {
    const text = await response.text();

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function Map() {
    const {
        weather,
        position,
        setPosition,
        city,
        setCity,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        historicalWeather,
        loading,
        error,
        setError,
        handleSearchCity,
        handleGetWeather,
        loadHistoricalWeather
    } = useWeatherLogic();

    const [chartName, setChartName] = useState('');
    const [savedCharts, setSavedCharts] = useState([]);
    const [chartsError, setChartsError] = useState('');
    const [chartsLoading, setChartsLoading] = useState(false);
    const [activeChartId, setActiveChartId] = useState(null);

    const [settings, setSettings] = useState({
        temperatureUnit: 'C',
        windSpeedUnit: 'kmh',
        theme: 'dark'
    });

    const getToken = () => sessionStorage.getItem('token');

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            const token = getToken();

            if (!token) {
                setSettings({
                    temperatureUnit: 'C',
                    windSpeedUnit: 'kmh',
                    theme: 'dark'
                });
                return;
            }

            try {
                const response = await fetch(SETTINGS_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await readResponse(response);

                if (!response.ok) {
                    console.error(
                        'Nie udało się pobrać ustawień:',
                        response.status,
                        data
                    );
                    return;
                }

                if (!data || typeof data !== 'object') {
                    console.error('Backend zwrócił nieprawidłowe ustawienia:', data);
                    return;
                }

                if (!cancelled) {
                    setSettings({
                        temperatureUnit: data.temperatureUnit ?? 'C',
                        windSpeedUnit: data.windSpeedUnit ?? 'kmh',
                        theme: data.theme ?? 'dark'
                    });
                }
            } catch (error) {
                console.error('Błąd połączenia podczas pobierania ustawień:', error);
            }
        };

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    const formatTemperature = temperature => {
        if (temperature == null) return '—';

        const value = settings.temperatureUnit === 'F'
            ? temperature * 9 / 5 + 32
            : temperature;

        return `${value.toFixed(1)}°${settings.temperatureUnit}`;
    };

    const formatWindSpeed = speed => {
        if (speed == null) return '—';

        const value = settings.windSpeedUnit === 'ms'
            ? speed / 3.6
            : speed;

        const unit = settings.windSpeedUnit === 'ms' ? 'm/s' : 'km/h';

        return `${value.toFixed(1)} ${unit}`;
    };

    const loadSavedCharts = async () => {
        const token = getToken();

        if (!token) {
            setSavedCharts([]);
            setActiveChartId(null);
            return;
        }

        setChartsLoading(true);
        setChartsError('');

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Nie udało się pobrać zapisanych wykresów.'
                );
            }

            if (!Array.isArray(data)) {
                throw new Error('Backend zwrócił nieprawidłową listę wykresów.');
            }

            setSavedCharts(data);

            setActiveChartId(currentId =>
                data.some(chart => String(chart.id) === String(currentId))
                    ? currentId
                    : null
            );
        } catch (error) {
            setChartsError(error.message);
        } finally {
            setChartsLoading(false);
        }
    };

    useEffect(() => {
        loadSavedCharts();
    }, []);

    const handleSaveChart = async () => {
        setChartsError('');

        if (!getToken()) {
            setChartsError('Zaloguj się, aby zapisywać wykresy.');
            return;
        }

        if (!historicalWeather) {
            setChartsError('Najpierw pobierz dane historyczne.');
            return;
        }

        if (!chartName.trim()) {
            setChartsError('Wpisz nazwę wykresu.');
            return;
        }

        if (!startDate || !endDate || startDate > endDate) {
            setChartsError('Wybierz prawidłowy zakres dat.');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    name: chartName.trim(),
                    locationName: city.trim() || 'Wybrana lokalizacja',
                    latitude: Number(position[0]),
                    longitude: Number(position[1]),
                    startDate,
                    endDate
                })
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Nie udało się zapisać wykresu.'
                );
            }

            setChartName('');
            await loadSavedCharts();
        } catch (error) {
            setChartsError(error.message);
        }
    };

    const handleUpdateChart = async chart => {
        setChartsError('');

        const token = getToken();

        if (!token) {
            setChartsError('Zaloguj się, aby edytować wykresy.');
            return false;
        }

        const start = formatDate(chart.startDate);
        const end = formatDate(chart.endDate);
        const lat = Number(chart.latitude);
        const lon = Number(chart.longitude);
        const name = chart.name.trim();
        const locationName = chart.locationName.trim();

        if (!name || !locationName) {
            setChartsError('Podaj nazwę wykresu i lokalizację.');
            return false;
        }

        if (!start || !end || start > end) {
            setChartsError('Wybierz prawidłowy zakres dat.');
            return false;
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            setChartsError('Nieprawidłowe współrzędne lokalizacji.');
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/${chart.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    locationName,
                    latitude: lat,
                    longitude: lon,
                    startDate: start,
                    endDate: end
                })
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Nie udało się zaktualizować wykresu.'
                );
            }

            setActiveChartId(chart.id);
            setPosition([lat, lon]);
            setCity(locationName);
            setStartDate(start);
            setEndDate(end);
            setError('');
            setChartsError('');

            await loadHistoricalWeather(lat, lon, start, end);
            await loadSavedCharts();

            return true;
        } catch (error) {
            setChartsError(error.message);
            return false;
        }
    };

    const handleDeleteChart = async id => {
        setChartsError('');

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Nie udało się usunąć wykresu.'
                );
            }

            if (String(activeChartId) === String(id)) {
                setActiveChartId(null);
            }

            await loadSavedCharts();
        } catch (error) {
            setChartsError(error.message);
        }
    };

    const handleOpenChart = async chart => {
        setError('');
        setChartsError('');

        const lat = Number(chart.latitude);
        const lon = Number(chart.longitude);
        const start = formatDate(chart.startDate);
        const end = formatDate(chart.endDate);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon) ||
            !start ||
            !end ||
            start > end
        ) {
            setChartsError('Zapisany wykres zawiera nieprawidłowe dane.');
            return;
        }

        setActiveChartId(chart.id);
        setPosition([lat, lon]);
        setCity(chart.locationName);
        setStartDate(start);
        setEndDate(end);

        await loadHistoricalWeather(lat, lon, start, end);
    };

    return (
        <div>
            {weather?.current && (
                <div className="weather-cards">
                    <div className="weather-card">
                        <span>Temperatura</span>
                        <strong>
                            {formatTemperature(weather.current.temperature_2m)}
                        </strong>
                    </div>

                    <div className="weather-card">
                        <span>Wiatr</span>
                        <strong>
                            {formatWindSpeed(weather.current.wind_speed_10m)}
                        </strong>
                    </div>

                    <div className="weather-card">
                        <span>Wilgotność</span>
                        <strong>{weather.current.relative_humidity_2m}%</strong>
                    </div>

                    <div className="weather-card">
                        <span>Zachmurzenie</span>
                        <strong>{weather.current.cloud_cover}%</strong>
                    </div>
                </div>
            )}

            <CitySearch
                city={city}
                setCity={setCity}
                handleSearchCity={handleSearchCity}
            />

            <div className="map-container">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '500px', width: '100%' }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapViewUpdater position={position} />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                    />
                </MapContainer>
            </div>

            <div className="weather-controls">
                <div className="date-input">
                    <label>
                        Data od:
                        <input
                            type="date"
                            value={startDate}
                            onChange={event => {
                                setStartDate(event.target.value);
                                setActiveChartId(null);
                            }}
                        />
                    </label>
                </div>

                <div className="date-input">
                    <label>
                        Data do:
                        <input
                            type="date"
                            value={endDate}
                            onChange={event => {
                                setEndDate(event.target.value);
                                setActiveChartId(null);
                            }}
                        />
                    </label>
                </div>

                <Button onClick={() => {
                    setActiveChartId(null);
                    handleGetWeather();
                }}>
                    {loading ? 'Pobieranie...' : 'Pobierz pogodę'}
                </Button>
            </div>

            {error && <div className="weather-error">{error}</div>}

            {historicalWeather && (
                <>
                    <TemperatureChart
                        weather={historicalWeather}
                        temperatureUnit={settings.temperatureUnit}
                    />

                    <div className="saved-charts-controls">
                        <input
                            type="text"
                            value={chartName}
                            onChange={event => setChartName(event.target.value)}
                            placeholder="Nazwa wykresu..."
                            maxLength={100}
                        />
                        <Button onClick={handleSaveChart}>
                            Zapisz wykres
                        </Button>
                    </div>
                </>
            )}

            {chartsError && (
                <div className="weather-error">{chartsError}</div>
            )}

            <SavedCharts
                savedCharts={savedCharts}
                chartsLoading={chartsLoading}
                onOpenChart={handleOpenChart}
                onDeleteChart={handleDeleteChart}
                onUpdateChart={handleUpdateChart}
                activeChartId={activeChartId}
            />
        </div>
    );
}

export default Map;
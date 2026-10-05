import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import Button from './Button';
import LocationMarker from './LocationMarker';
import TemperatureChart from './TemperatureChart';

import { useWeatherLogic } from './MapLogic';

function Map() {
    const {
        weather,
        position,
        setPosition,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        historicalWeather,
        loading,
        error,
        handleGetWeather
    } = useWeatherLogic();

    return (
        <div>

            {weather && (
                <div className="weather-cards">

                    <div className="weather-card">
                        <span>Temperatura</span>
                        <strong>
                            {weather.temperature_2m}°C
                        </strong>
                    </div>

                    <div className="weather-card">
                        <span>Wiatr</span>
                        <strong>
                            {weather.wind_speed_10m} km/h
                        </strong>
                    </div>

                    <div className="weather-card">
                        <span>Wilgotność</span>
                        <strong>
                            {weather.relative_humidity_2m}%
                        </strong>
                    </div>

                    <div className="weather-card">
                        <span>Zachmurzenie</span>
                        <strong>
                            {weather.cloud_cover}%
                        </strong>
                    </div>

                </div>
            )}

            <div className="map-container">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{
                        height: '500px',
                        width: '100%'
                    }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

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
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />
                    </label>
                </div>

                <div className="date-input">
                    <label>
                        Data do:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />
                    </label>
                </div>

                <Button onClick={handleGetWeather}>
                    {loading
                        ? 'Pobieranie...'
                        : 'Pobierz pogodę'}
                </Button>

            </div>

            {error && (
                <div className="weather-error">
                    {error}
                </div>
            )}

            {historicalWeather && (
                <TemperatureChart
                    weather={historicalWeather}
                />
            )}

        </div>
    );
}

export default Map;
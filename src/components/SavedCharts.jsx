import { useEffect, useState } from 'react';
import './SavedCharts.css';

const API_URL = import.meta.env.VITE_API_URL;

function SavedCharts({
    savedCharts = [],
    chartsLoading,
    onOpenChart,
    onDeleteChart,
    onUpdateChart,
    activeChartId
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (editingId === null || editLocation.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_URL}/WeatherForecast/cities?city=${encodeURIComponent(editLocation)}`
                );

                if (!response.ok) {
                    throw new Error();
                }

                setSuggestions(await response.json());
            } catch {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [editingId, editLocation]);

    const startEditing = (event, chart) => {
        event.stopPropagation();
        setEditingId(chart.id);
        setEditName(chart.name);
        setEditLocation(chart.locationName);
        setSelectedLocation({
            name: chart.locationName,
            latitude: chart.latitude,
            longitude: chart.longitude
        });
        setStartDate(String(chart.startDate).slice(0, 10));
        setEndDate(String(chart.endDate).slice(0, 10));
        setSuggestions([]);
    };

    const cancelEditing = event => {
        event.stopPropagation();
        setEditingId(null);
        setSuggestions([]);
    };

    const handleSelectLocation = location => {
        setEditLocation(location.name);
        setSelectedLocation(location);
        setSuggestions([]);
    };

    const saveChanges = async (event, chart) => {
        event.stopPropagation();

        if (!editName.trim()) {
            alert('Wpisz nazwę wykresu.');
            return;
        }

        if (!selectedLocation) {
            alert('Wybierz lokalizację z listy podpowiedzi.');
            return;
        }

        if (!startDate || !endDate || startDate > endDate) {
            alert('Wybierz prawidłowy zakres dat.');
            return;
        }

        const success = await onUpdateChart({
            ...chart,
            name: editName.trim(),
            locationName: selectedLocation.name,
            latitude: Number(selectedLocation.latitude),
            longitude: Number(selectedLocation.longitude),
            startDate,
            endDate
        });

        if (success === false) {
            return;
        }

        setEditingId(null);
        setSuggestions([]);
    };

    return (
        <div className="saved-locations saved-charts">
            <button
                type="button"
                className="saved-locations-toggle"
                onClick={() => setIsOpen(previous => !previous)}
                aria-expanded={isOpen}
            >
                <span>📈 Moje zapisane wykresy</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="saved-locations-list">
                    {chartsLoading ? (
                        <div className="saved-locations-empty">
                            Wczytywanie wykresów...
                        </div>
                    ) : savedCharts.length === 0 ? (
                        <div className="saved-locations-empty">
                            Nie masz jeszcze zapisanych wykresów.
                        </div>
                    ) : (
                        savedCharts.map(chart => {
                            const isActive =
                                activeChartId != null &&
                                chart.id != null &&
                                String(activeChartId) === String(chart.id);

                            return (
                                <div
                                    className={`saved-location${isActive ? ' active-chart' : ''}`}
                                    key={chart.id}
                                >
                                    {editingId === chart.id ? (
                                        <div
                                            className="saved-chart-edit"
                                            onClick={event => event.stopPropagation()}
                                        >
                                            <label>
                                                Nazwa wykresu
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    maxLength={100}
                                                    onChange={event => setEditName(event.target.value)}
                                                />
                                            </label>

                                            <label>
                                                Lokalizacja
                                                <input
                                                    type="text"
                                                    value={editLocation}
                                                    onChange={event => {
                                                        setEditLocation(event.target.value);
                                                        setSelectedLocation(null);
                                                    }}
                                                    placeholder="Wpisz miasto..."
                                                />
                                            </label>

                                            {suggestions.length > 0 && (
                                                <div className="saved-chart-suggestions">
                                                    {suggestions.map((location, index) => (
                                                        <button
                                                            type="button"
                                                            key={`${location.name}-${location.country}-${index}`}
                                                            onClick={() => handleSelectLocation(location)}
                                                        >
                                                            <strong>{location.name}</strong>
                                                            {location.country && (
                                                                <span>{location.country}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <label>
                                                Data początkowa
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={event => setStartDate(event.target.value)}
                                                />
                                            </label>

                                            <label>
                                                Data końcowa
                                                <input
                                                    type="date"
                                                    min={startDate || undefined}
                                                    value={endDate}
                                                    onChange={event => setEndDate(event.target.value)}
                                                />
                                            </label>

                                            <div className="saved-chart-edit-actions">
                                                <button
                                                    type="button"
                                                    onClick={event => saveChanges(event, chart)}
                                                >
                                                    Zapisz
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                >
                                                    Anuluj
                                                </button>

                                                <button
                                                    type="button"
                                                    className="saved-location-delete"
                                                    title="Usuń wykres"
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        onDeleteChart(chart.id);
                                                        setEditingId(null);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="saved-location-info"
                                                onClick={() => onOpenChart(chart)}
                                            >
                                                {isActive && (
                                                    <span className="active-chart-badge">
                                                        AKTYWNY
                                                    </span>
                                                )}

                                                <strong>{chart.name}</strong>
                                                <span>{chart.locationName}</span>
                                                <span>
                                                    {String(chart.startDate).slice(0, 10)} – {String(chart.endDate).slice(0, 10)}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="saved-chart-edit-button"
                                                title="Edytuj wykres"
                                                onClick={event => startEditing(event, chart)}
                                            >
                                                Edytuj
                                            </button>

                                            <button
                                                type="button"
                                                className="saved-location-delete"
                                                title="Usuń wykres"
                                                onClick={event => {
                                                    event.stopPropagation();
                                                    onDeleteChart(chart.id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default SavedCharts;
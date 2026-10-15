import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import './CitySearch.css';

const API_URL = import.meta.env.VITE_API_URL;
const SAVED_LOCATIONS_URL = `${API_URL}/SavedLocations`;

function CitySearch({ city, setCity, handleSearchCity }) {
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [savedLocations, setSavedLocations] = useState([]);
    const [isSavedOpen, setIsSavedOpen] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const searchRef = useRef(null);
    const skipSuggestionsRef = useRef(false);

    const getToken = () => sessionStorage.getItem('token');

    const loadSavedLocations = async () => {
        const token = getToken();

        if (!token) {
            setSavedLocations([]);
            return;
        }

        try {
            const response = await fetch(SAVED_LOCATIONS_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się pobrać zapisanych lokalizacji.');
            }

            const data = await response.json();
            setSavedLocations(data);
        } catch {
            setSavedLocations([]);
        }
    };

    useEffect(() => {
        loadSavedLocations();
    }, []);

    useEffect(() => {
        if (skipSuggestionsRef.current) {
            skipSuggestionsRef.current = false;
            setSuggestions([]);
            return;
        }

        if (city.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetch(
                `${API_URL}/WeatherForecast/cities?city=${encodeURIComponent(city)}`
            )
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Nie udało się pobrać miast.');
                    }

                    return response.json();
                })
                .then(data => setSuggestions(data))
                .catch(() => setSuggestions([]));
        }, 300);

        return () => clearTimeout(timeout);
    }, [city]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleSelectCity = selected => {
        skipSuggestionsRef.current = true;
        setCity(selected.name);
        setSelectedCity(selected);
        setSuggestions([]);
        setSaveMessage('');
        handleSearchCity(selected);
    };


    const handleSearch = () => {
        setSuggestions([]);
        setSelectedCity(null);
        setSaveMessage('');
        handleSearchCity();
    };

    const handleSaveLocation = async () => {
        setSaveMessage('');

        const token = getToken();

        if (!token) {
            setSaveMessage('Zaloguj się, aby zapisywać lokalizacje.');
            return;
        }

        if (!selectedCity) {
            setSaveMessage('Najpierw wybierz miasto z listy podpowiedzi.');
            return;
        }

        const alreadySaved = savedLocations.some(
            location =>
                Math.abs(Number(location.latitude) - Number(selectedCity.latitude)) < 0.000001 &&
                Math.abs(Number(location.longitude) - Number(selectedCity.longitude)) < 0.000001
        );

        if (alreadySaved) {
            setSaveMessage('Ta lokalizacja jest już zapisana.');
            return;
        }

        try {
            const response = await fetch(SAVED_LOCATIONS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: selectedCity.name,
                    address: selectedCity.address || selectedCity.country || null,
                    latitude: Number(selectedCity.latitude),
                    longitude: Number(selectedCity.longitude)
                })
            });

            if (!response.ok) {
                throw new Error();
            }

            await loadSavedLocations();
            setSaveMessage('Lokalizacja została zapisana.');
        } catch {
            setSaveMessage('Nie udało się zapisać lokalizacji. Spróbuj ponownie.');
        }
    };

    const handleSelectSavedLocation = location => {
        skipSuggestionsRef.current = true;

        setCity(location.name);
        setSelectedCity(location);
        setSuggestions([]);
        setIsSavedOpen(false);
        setSaveMessage('');

        handleSearchCity({
            latitude: Number(location.latitude),
            longitude: Number(location.longitude)
        });
    };

    const handleDeleteLocation = async (event, id) => {
        event.stopPropagation();

        const token = getToken();

        if (!token) {
            setSaveMessage('Zaloguj się, aby usuwać zapisane lokalizacje.');
            return;
        }

        try {
            const response = await fetch(`${SAVED_LOCATIONS_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error();
            }

            setSavedLocations(previous =>
                previous.filter(location => location.id !== id)
            );
            setSaveMessage('Lokalizacja została usunięta.');
        } catch {
            setSaveMessage('Nie udało się usunąć lokalizacji. Spróbuj ponownie.');
        }
    };

    const isSelectedCitySaved = selectedCity && savedLocations.some(
        location =>
            Math.abs(Number(location.latitude) - Number(selectedCity.latitude)) < 0.000001 &&
            Math.abs(Number(location.longitude) - Number(selectedCity.longitude)) < 0.000001
    );

    return (
        <div className="city-search" ref={searchRef}>
            <div className="city-search-row">
                <input
                    type="text"
                    placeholder="Wpisz miasto..."
                    value={city}
                    onChange={event => {
                        setCity(event.target.value);
                        setSelectedCity(null);
                        setSaveMessage('');
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />

                <Button onClick={handleSearch}>
                    Szukaj
                </Button>

                <Button
                    className="save-location-button"
                    onClick={handleSaveLocation}
                    disabled={!selectedCity || isSelectedCitySaved}
                >
                    ♡ Zapisz
                </Button>
            </div>

            {saveMessage && (
                <div
                    className={saveMessage.includes('zapisana') ? 'weather-success' : 'weather-error'}
                    role="status"
                >
                    {saveMessage}
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="city-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <div
                            className="city-suggestion"
                            key={`${suggestion.name}-${suggestion.country}-${index}`}
                            onClick={() => handleSelectCity(suggestion)}
                        >
                            <strong>{suggestion.name}</strong>

                            {suggestion.country && (
                                <span>{suggestion.country}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="saved-locations">
                <button
                    className="saved-locations-toggle"
                    onClick={() => setIsSavedOpen(!isSavedOpen)}
                >
                    <span>★ Moje lokalizacje</span>
                    <span>{isSavedOpen ? '▲' : '▼'}</span>
                </button>

                {isSavedOpen && (
                    <div className="saved-locations-list">
                        {savedLocations.length === 0 ? (
                            <div className="saved-locations-empty">
                                Nie masz jeszcze zapisanych lokalizacji.
                            </div>
                        ) : (
                            savedLocations.map(location => (
                                <div
                                    className="saved-location"
                                    key={location.id}
                                    onClick={() => handleSelectSavedLocation(location)}
                                >
                                    <div className="saved-location-info">
                                        <strong>{location.name}</strong>

                                        {(location.address || location.country) && (
                                            <span>
                                                {location.address || location.country}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        className="saved-location-delete"
                                        onClick={event =>
                                            handleDeleteLocation(event, location.id)
                                        }
                                        title="Usuń lokalizację"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CitySearch;
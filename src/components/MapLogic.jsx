import { useEffect, useState } from 'react';
//test
const API_URL = import.meta.env.VITE_API_URL;

function getCoordinates(data) {
    const latitude = Number(data?.latitude ?? data?.Latitude);
    const longitude = Number(data?.longitude ?? data?.Longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error('Nie otrzymano prawidłowych współrzędnych lokalizacji.');
    }

    return [latitude, longitude];
}

export function useWeatherLogic() {
    const [position, setPosition] = useState([51.38, 21.17]);
    const [weather, setWeather] = useState(null);
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [historicalWeather, setHistoricalWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const latitude = position[0];
    const longitude = position[1];

    useEffect(() => {
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            setError('Lokalizacja ma nieprawidłowe współrzędne.');
            return;
        }

        fetch(
            `${API_URL}/WeatherForecast/now?latitude=${latitude}&longitude=${longitude}`
        )
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text());
                }

                return response.json();
            })
            .then(setWeather)
            .catch(error => {
                setError(error.message || 'Nie udało się pobrać aktualnej pogody.');
            });
    }, [latitude, longitude]);

    const handleSearchCity = async (selectedCity = null) => {
        setError('');

        try {
            if (selectedCity) {
                setPosition(getCoordinates(selectedCity));
                return;
            }

            if (!city.trim()) {
                setError('Wpisz nazwę miasta.');
                return;
            }

            const response = await fetch(
                `${API_URL}/WeatherForecast/cities?city=${encodeURIComponent(city)}`
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();

            setPosition(getCoordinates(data));
        } catch (error) {
            setError(error.message || 'Nie udało się znaleźć miasta.');
        }
    };

    const loadHistoricalWeather = async (
        lat = latitude,
        lon = longitude,
        start = startDate,
        end = endDate
    ) => {
        setError('');

        if (!start || !end) {
            setError('Wybierz obie daty.');
            return;
        }

        if (start > end) {
            setError('Data początkowa nie może być późniejsza niż końcowa.');
            return;
        }

        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
            setError('Lokalizacja ma nieprawidłowe współrzędne.');
            return;
        }

        setLoading(true);

        try {
            const url =
                `${API_URL}/WeatherForecast/archive?` +
                `latitude=${lat}&longitude=${lon}` +
                `&startDate=${start}&endDate=${end}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            setHistoricalWeather(data);
        } catch (error) {
            setError(error.message || 'Nie udało się pobrać danych pogodowych.');
            setHistoricalWeather(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGetWeather = () => {
        loadHistoricalWeather();
    };

    return {
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
        setHistoricalWeather,
        loading,
        error,
        setError,
        handleSearchCity,
        handleGetWeather,
        loadHistoricalWeather
    };
}
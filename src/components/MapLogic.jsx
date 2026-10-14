
import { useEffect, useState } from 'react';

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
        fetch(
            `https://localhost:7039/WeatherForecast/now?latitude=${latitude}&longitude=${longitude}`
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

    const handleSearchCity = (selectedCity = null) => {
        setError('');

        if (selectedCity) {
            setPosition([
                Number(selectedCity.latitude),
                Number(selectedCity.longitude)
            ]);
            return;
        }

        if (!city.trim()) {
            setError('Wpisz nazwę miasta.');
            return;
        }

        fetch(
            `https://localhost:7039/WeatherForecast/city?city=${encodeURIComponent(city)}`
        )
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text());
                }

                return response.json();
            })
            .then(data => {
                setPosition([
                    Number(data.latitude),
                    Number(data.longitude)
                ]);
            })
            .catch(error => {
                setError(error.message || 'Nie udało się znaleźć miasta.');
            });
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

        setLoading(true);

        try {
            const url =
                `https://localhost:7039/WeatherForecast/archive?` +
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

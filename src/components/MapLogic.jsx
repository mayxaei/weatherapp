import { useEffect, useState } from 'react';

export function useWeatherLogic() {
    const [weather, setWeather] = useState(null);
    const [position, setPosition] = useState([51.3841, 21.1741]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [historicalWeather, setHistoricalWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const latitude = position[0];
    const longitude = position[1];

    useEffect(() => {
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,cloud_cover&timezone=auto`
        )
            .then(response => response.json())
            .then(data => {
                setWeather(data.current);
            });
    }, [latitude, longitude]);

    const handleGetWeather = () => {
        setError('');
        setHistoricalWeather(null);

        if (!startDate || !endDate) {
            setError('Wybierz obie daty.');
            return;
        }

        if (startDate > endDate) {
            setError(
                'Data początkowa nie może być późniejsza niż data końcowa.'
            );
            return;
        }

        setLoading(true);

        const url =
            `https://archive-api.open-meteo.com/v1/archive?` +
            `latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&start_date=${startDate}` +
            `&end_date=${endDate}` +
            `&daily=temperature_2m_mean` +
            `&timezone=auto`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nie udało się pobrać danych.');
                }

                return response.json();
            })
            .then(data => {
                setHistoricalWeather(data);
            })
            .catch(() => {
                setError('Nie udało się pobrać danych pogodowych.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return {
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
    };
}
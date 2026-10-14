import { useEffect, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

function LocationMarker({ position, setPosition }) {
    const [address, setAddress] = useState('');

    useEffect(() => {
        setAddress('Pobieranie adresu...');

        fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        )
            .then(response => response.json())
            .then(data => {
                setAddress(
                    data.display_name || 'Nie znaleziono adresu.'
                );
            })
            .catch(() => {
                setAddress('Nie udało się pobrać adresu.');
            });
    }, [position]);

    useMapEvents({
        click(e) {
            setPosition([
                e.latlng.lat,
                e.latlng.lng
            ]);
        }
    });

    return (
        <Marker position={position}>
            <Popup>
                {address || 'Wybrana lokalizacja'}
            </Popup>
        </Marker>
    );
}

export default LocationMarker;
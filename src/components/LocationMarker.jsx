import { useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';

function LocationMarker({ position, setPosition }) {
    const [address, setAddress] = useState('');

    useMapEvents({
        click(e) {
            const newPosition = [e.latlng.lat, e.latlng.lng];

            setPosition(newPosition);
            setAddress('Pobieranie adresu...');

            fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`
            )
                .then(response => response.json())
                .then(data => {
                    setAddress(data.display_name || 'Nie znaleziono adresu.');
                })
                .catch(() => {
                    setAddress('Nie udało się pobrać adresu.');
                });
        },
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
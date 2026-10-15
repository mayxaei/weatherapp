import { useEffect, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }) {
    const [address, setAddress] = useState('');

    const validPosition =
        Array.isArray(position) &&
        position.length >= 2 &&
        Number.isFinite(Number(position[0])) &&
        Number.isFinite(Number(position[1])) &&
        Number(position[0]) >= -90 &&
        Number(position[0]) <= 90 &&
        Number(position[1]) >= -180 &&
        Number(position[1]) <= 180;

    useEffect(() => {
        if (!validPosition) {
            setAddress('');
            return;
        }

        const controller = new AbortController();

        setAddress('Pobieranie adresu...');

        fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${Number(position[0])}&lon=${Number(position[1])}&format=json`,
            { signal: controller.signal }
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nie udało się pobrać adresu.');
                }
                return response.json();
            })
            .then(data => {
                setAddress(data.display_name || 'Nie znaleziono adresu.');
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    setAddress('Nie udało się pobrać adresu.');
                }
            });

        return () => controller.abort();
    }, [position, validPosition]);

    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        }
    });

    if (!validPosition) {
        return null;
    }

    return (
        <Marker
            position={[Number(position[0]), Number(position[1])]}
            icon={defaultIcon}
        >
            <Popup>
                {address || 'Wybrana lokalizacja'}
            </Popup>
        </Marker>
    );
}

export default LocationMarker;
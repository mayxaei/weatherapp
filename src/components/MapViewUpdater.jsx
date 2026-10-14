import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapViewUpdater({ position }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);

    return null;
}

export default MapViewUpdater;

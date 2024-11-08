import  { useState, useEffect, useRef } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Container, TextInput, Text, Button } from '@mantine/core';
import { ArrowLeft, MapPin } from 'lucide-react';
import styles from './index.module.css';

// Tipos
interface Suggestion {
  id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface Location {
  lat: number;
  lng: number;
}

function OrigenView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Referencias
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Inicializar servicios de Google Maps
  const initializeServices = () => {
    if (!window.google) return;

    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    const tempNode = document.createElement('div');
    const tempMap = new google.maps.Map(tempNode);
    placesServiceRef.current = new google.maps.places.PlacesService(tempMap);
  };

  useEffect(() => {
    initializeServices();
  }, []);

  // Manejar búsqueda de lugares
  useEffect(() => {
    if (!searchTerm || !autocompleteServiceRef.current) return;

    const timer = setTimeout(() => {
      const request: google.maps.places.AutocompletionRequest = {
        input: searchTerm,
        componentRestrictions: { country: 'co' },
      };

      autocompleteServiceRef.current?.getPlacePredictions(
        request,
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => ({
              id: prediction.place_id,
              description: prediction.description,
              main_text: prediction.structured_formatting.main_text,
              secondary_text: prediction.structured_formatting.secondary_text,
            }));
            setResults(suggestions);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Inicializar mapa
  const initializeMap = (location: Location) => {
    if (!mapContainerRef.current || !window.google) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: location,
      zoom: 15,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });

    mapRef.current = map;

    const marker = new google.maps.Marker({
      map,
      position: location,
      draggable: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#00F2C3',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }
    });

    markerRef.current = marker;

    // Eventos del mapa
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        updateLocationDetails({
          lat: position.lat(),
          lng: position.lng()
        });
      }
    });

    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        updateLocationDetails({
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        });
      }
    });
  };

  // Actualizar detalles de ubicación
  const updateLocationDetails = async (location: Location) => {
    if (!window.google) return;

    setSelectedLocation(location);
    if (markerRef.current) {
      markerRef.current.setPosition(location);
    }
    if (mapRef.current) {
      mapRef.current.panTo(location);
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location });
      if (response.results[0]) {
        setSearchTerm(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error en geocoding:', error);
    }
  };

  // Manejar selección de lugar
  const handlePlaceSelect = (suggestion: Suggestion) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.id,
        fields: ['geometry', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          setSelectedLocation(location);
          setSearchTerm(suggestion.description);
          setResults([]);
          setShowMap(true);

          if (!mapRef.current) {
            initializeMap(location);
          } else {
            updateLocationDetails(location);
          }
        }
      }
    );
  };

  // Confirmar ubicación
  const handleConfirmLocation = () => {
    if (selectedLocation && searchTerm) {
      navigate({
        to: '/publicarviaje',
        search: {
          selectedAddress: searchTerm
        }
      });
    }
  };

  return (
    <Container className={styles.container}>
      <div className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <Link to="/publicarviaje" className={styles.backButton}>
            <ArrowLeft size={24} />
          </Link>
          <div className={styles.searchBox}>
            <MapPin className={styles.searchIcon} size={20} />
            <TextInput
              placeholder="¿Desde dónde sales?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              variant="unstyled"
              className={styles.input}
            />
          </div>
        </div>

        {results.length > 0 && !showMap && (
          <div className={styles.resultsList}>
            {results.map((result) => (
              <button
                key={result.id}
                className={styles.resultItem}
                onClick={() => handlePlaceSelect(result)}
              >
                <MapPin size={18} className={styles.resultIcon} />
                <div className={styles.resultContent}>
                  <Text className={styles.mainText}>{result.main_text}</Text>
                  <Text className={styles.secondaryText}>{result.secondary_text}</Text>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showMap && (
        <div className={styles.mapSection}>
          <div ref={mapContainerRef} className={styles.map} />
        </div>
      )}

      {selectedLocation && (
        <Button
          className={styles.confirmButton}
          onClick={handleConfirmLocation}
        >
          Confirmar ubicación
        </Button>
      )}
    </Container>
  );
}

// Definir la ruta después del componente
export const Route = createFileRoute('/Origen/')({
  component: OrigenView,
});

export default OrigenView;
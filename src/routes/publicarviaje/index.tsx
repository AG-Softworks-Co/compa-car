import React, { useState, useRef, useCallback } from 'react';
import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import {
  Container,
  Title,
  TextInput,
  Button,
  Text,
  UnstyledButton,
  Modal,
  
} from '@mantine/core';
import { MapPin, ArrowLeft, Clock, Navigation } from 'lucide-react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import styles from './index.module.css';

interface SearchParams {
  selectedAddress?: string;
  selectedDestination?: string;
}

interface LocationData {
  address: string;
  city?: string;
  coords: {
    lat: number;
    lng: number;
  };
}

export const Route = createFileRoute('/publicarviaje/')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      selectedAddress: search.selectedAddress as string | undefined,
      selectedDestination: search.selectedDestination as string | undefined,
    };
  },
  component: ReservarView,
});

const mapOptions: google.maps.MapOptions = {
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    }
  ],
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
};

function ReservarView() {
  const { selectedAddress = '', selectedDestination = '' } = useSearch({ from: '/publicarviaje/' });
  
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  // Efecto para geocodificar las direcciones
  React.useEffect(() => {
    if (!window.google) return;
    
    const geocoder = new google.maps.Geocoder();

    if (selectedAddress) {
      geocoder.geocode({ address: selectedAddress }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const result = results[0];
          const city = result.address_components.find(
            component => component.types.includes('locality')
          )?.long_name;
          
          const locationData = {
            address: selectedAddress,
            city,
            coords: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            }
          };
          
          setOrigin(locationData);
          console.log('Origen:', locationData);
        }
      });
    }

    if (selectedDestination) {
      geocoder.geocode({ address: selectedDestination }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const result = results[0];
          const city = result.address_components.find(
            component => component.types.includes('locality')
          )?.long_name;
          
          const locationData = {
            address: selectedDestination,
            city,
            coords: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            }
          };
          
          setDestination(locationData);
          console.log('Destino:', locationData);
        }
      });
    }
  }, [selectedAddress, selectedDestination]);

  const calculateRoute = useCallback(() => {
    if (!origin?.coords || !destination?.coords || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    
    const request: google.maps.DirectionsRequest = {
      origin: origin.coords,
      destination: destination.coords,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      optimizeWaypoints: true,
      avoidHighways: false,
      avoidTolls: false,
    };
    
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        setDirections(result);
        if (result.routes[0].legs[0]) {
          setRouteDetails({
            distance: result.routes[0].legs[0].distance?.text || '',
            duration: result.routes[0].legs[0].duration?.text || ''
          });
        }
        setShowRouteMap(true);

        // Log de la ruta calculada
        console.log('Ruta calculada:', {
          distancia: result.routes[0].legs[0].distance?.text,
          duracion: result.routes[0].legs[0].duration?.text,
          origen: origin,
          destino: destination
        });
      }
    });
  }, [origin, destination]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Ajustar el viewport para mostrar toda la ruta
    if (directions && directions.routes[0].bounds) {
      map.fitBounds(directions.routes[0].bounds);
    }
  };

  return (
    <Container fluid className={styles.container}>
      <div className={styles.header}>
        <UnstyledButton component={Link} to="/" className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
        <Title className={styles.headerTitle}>Reservar viaje</Title>
      </div>

      <Container size="sm" className={styles.content}>
        <div className={styles.stepContent}>
          <Title className={styles.stepTitle}>¿Desde dónde sales?</Title>
          <div className={styles.searchBox}>
            <MapPin className={styles.searchIcon} size={20} />
            <Link
              to="/Origen"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <TextInput
                placeholder="Escribe la dirección completa"
                className={styles.input}
                value={selectedAddress}
                readOnly
              />
            </Link>
          </div>

          <Title className={styles.stepTitle}>¿A dónde vas?</Title>
          <div className={styles.searchBox}>
            <MapPin className={styles.searchIcon} size={20} />
            <Link
              to="/Destino"
              search={{ originAddress: selectedAddress }}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <TextInput
                placeholder="Escribe la dirección completa"
                className={styles.input}
                value={selectedDestination}
                readOnly
              />
            </Link>
          </div>
        </div>

        {origin && destination && (
          <Button 
            onClick={calculateRoute}
            className={styles.nextButton}
            style={{ marginTop: '20px', width: '100%' }}
          >
            Ver ruta en el mapa
          </Button>
        )}

        <Modal
          opened={showRouteMap}
          onClose={() => setShowRouteMap(false)}
          title="Ruta del viaje"
          fullScreen
          transitionProps={{ transition: 'fade', duration: 200 }}
          classNames={{
            root: styles.routeModal,
            header: styles.routeModalTitle,
            body: styles.routeModalContent
          }}
        >
          {routeDetails && (
            <div className={styles.routeInfo}>
              <div className={styles.routeTime}>
                <Clock size={20} />
                <Text>{routeDetails.duration}</Text>
              </div>
              <div className={styles.routeDistance}>
                <Navigation size={20} />
                <Text>{routeDetails.distance}</Text>
              </div>
            </div>
          )}

          <div className={styles.mapContainer}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: 'calc(100vh - 130px)' }}
              center={origin?.coords || { lat: 4.6097, lng: -74.0817 }}
              zoom={12}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeColor: '#00ff9d',
                      strokeWeight: 5,
                      strokeOpacity: 0.8
                    },
                    markerOptions: {
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: '#00ff9d',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                      }
                    }
                  }}
                />
              )}
            </GoogleMap>
          </div>

          <Button
            className={styles.confirmRouteButton}
            onClick={() => setShowRouteMap(false)}
          >
            Confirmar ruta
          </Button>
        </Modal>
      </Container>
    </Container>
  );
}

export default ReservarView;
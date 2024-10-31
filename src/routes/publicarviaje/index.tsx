
import  { useState, useRef, useCallback, useEffect } from 'react';
import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import {
  Container,
  Title,
  TextInput,
  Button,
  Text,
  UnstyledButton,
  Modal,
  Stack,
  Badge,
  Loader,
} from '@mantine/core';
import { MapPin, ArrowLeft, Clock, Navigation } from 'lucide-react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import styles from './index.module.css';

// Interfaces
interface SearchParams {
  selectedAddress?: string;
  selectedDestination?: string;
}

interface Coords {
  lat: number;
  lng: number;
}

interface LocationData {
  address: string;
  city?: string;
  coords: Coords;
}

interface RouteInfo {
  distance: string;
  duration: string;
  summary: string;
  bounds: google.maps.LatLngBounds;
  route: google.maps.DirectionsRoute;
  index: number;
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
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    }
  ],
  disableDefaultUI: false, // Cambiado a false para mostrar controles
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  backgroundColor: '#242f3e',
  gestureHandling: 'greedy',
};

function ReservarView() {
  const { selectedAddress = '', selectedDestination = '' } = useSearch({ from: '/publicarviaje/' });
  
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Efecto para verificar que Google Maps esté cargado
  useEffect(() => {
    console.log('Estado inicial de Google Maps:', {
      isLoaded: !!window.google?.maps,
      selectedAddress,
      selectedDestination
    });
  }, []);

  // Efecto para geocodificar direcciones
  useEffect(() => {
    if (!window.google?.maps || !selectedAddress || !selectedDestination) {
      console.log('Esperando datos para geocodificar:', {
        googleMaps: !!window.google?.maps,
        origen: selectedAddress,
        destino: selectedDestination
      });
      return;
    }

    async function geocodeAddresses() {
      const geocoder = new google.maps.Geocoder();
      setIsLoading(true);
      
      try {
        // Geocodificar origen
        console.log('Geocodificando origen:', selectedAddress);
        const originResults = await geocoder.geocode({ address: selectedAddress });
        if (originResults.results[0]) {
          const result = originResults.results[0];
          const originData = {
            address: selectedAddress,
            city: result.address_components.find(c => c.types.includes('locality'))?.long_name,
            coords: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            }
          };
          console.log('Origen geocodificado:', originData);
          setOrigin(originData);
        }

        // Geocodificar destino
        console.log('Geocodificando destino:', selectedDestination);
        const destResults = await geocoder.geocode({ address: selectedDestination });
        if (destResults.results[0]) {
          const result = destResults.results[0];
          const destData = {
            address: selectedDestination,
            city: result.address_components.find(c => c.types.includes('locality'))?.long_name,
            coords: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            }
          };
          console.log('Destino geocodificado:', destData);
          setDestination(destData);
        }
      } catch (err) {
        console.error('Error en geocoding:', err);
        setError('Error obteniendo las coordenadas');
      } finally {
        setIsLoading(false);
      }
    }

    geocodeAddresses();
  }, [selectedAddress, selectedDestination]);

  // Función para calcular la ruta
  const calculateRoute = useCallback(async () => {
    if (!origin?.coords || !destination?.coords || !window.google) {
      console.log('Faltan datos para calcular ruta:', {
        tieneOrigen: !!origin?.coords,
        tieneDestino: !!destination?.coords,
        tieneGoogleMaps: !!window.google
      });
      setError('No se pueden obtener las coordenadas');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('Iniciando cálculo de ruta:', {
      origen: origin.coords,
      destino: destination.coords
    });

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const request: google.maps.DirectionsRequest = {
        origin: origin.coords,
        destination: destination.coords,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
      };

      console.log('Request de ruta:', request);

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (response, status) => {
          console.log('Respuesta DirectionsService:', {
            status,
            tieneRespuesta: !!response,
            cantidadRutas: response?.routes?.length
          });

          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Error en DirectionsService: ${status}`));
          }
        });
      });

      console.log('Rutas obtenidas:', result.routes);
      setDirections(result);

      // Procesar todas las rutas disponibles
      const routesInfo = result.routes.map((route, index) => {
        const routeInfo = {
          distance: route.legs[0].distance?.text || '',
          duration: route.legs[0].duration?.text || '',
          summary: route.summary || '',
          bounds: route.bounds,
          route: route,
          index
        };
        console.log(`Ruta ${index}:`, routeInfo);
        return routeInfo;
      });

      setRoutes(routesInfo);
      setSelectedRouteIndex(0);
      setShowRouteMap(true);

      // Ajustar el mapa a la primera ruta
      if (mapRef.current && result.routes[0].bounds) {
        console.log('Ajustando vista del mapa a los bounds:', result.routes[0].bounds.toString());
        mapRef.current.fitBounds(result.routes[0].bounds);
        setTimeout(() => {
          if (mapRef.current) {
            const zoom = mapRef.current.getZoom();
            console.log('Zoom actual:', zoom);
            if (zoom) {
              mapRef.current.setZoom(zoom - 0.5);
            }
          }
        }, 100);
      }

    } catch (err) {
      console.error('Error calculando rutas:', err);
      setError('Error al calcular las rutas disponibles');
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination]);

  // Función para manejar la selección de ruta
  const handleRouteSelect = useCallback((index: number) => {
    console.log('Seleccionando ruta:', index);
    setSelectedRouteIndex(index);

    const selectedRoute = routes[index];
    if (selectedRoute && mapRef.current) {
      console.log('Ajustando mapa a la ruta seleccionada');
      mapRef.current.fitBounds(selectedRoute.bounds);
      setTimeout(() => {
        if (mapRef.current) {
          const zoom = mapRef.current.getZoom();
          if (zoom) {
            mapRef.current.setZoom(zoom - 0.5);
          }
        }
      }, 100);
    }
  }, [routes]);

  // Función para cargar el mapa
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Mapa cargado');
    mapRef.current = map;
    setMapLoaded(true);

    // Crear DirectionsRenderer después de que el mapa esté cargado
    const renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#00ff9d',
        strokeWeight: 5,
        strokeOpacity: 0.8,
        geodesic: true,
      },
      markerOptions: {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#00ff9d',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 7,
        }
      }
    });
    
    directionsRendererRef.current = renderer;
  }, []);

  // Efecto para actualizar la ruta cuando cambia el DirectionsResult
  useEffect(() => {
    if (directions && directionsRendererRef.current) {
      console.log('Actualizando DirectionsRenderer');
      directionsRendererRef.current.setDirections(directions);
      directionsRendererRef.current.setRouteIndex(selectedRouteIndex);
    }
  }, [directions, selectedRouteIndex]);

  return (
    <Container fluid className={styles.container}>
      <div className={styles.header}>
        <UnstyledButton component={Link} to="/Home" className={styles.backButton}>
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

        {error && (
          <Text color="red" size="sm" mt="xs">
            {error}
          </Text>
        )}

        {origin && destination && (
          <Button 
            onClick={calculateRoute}
            className={styles.nextButton}
            loading={isLoading}
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
          <div className={styles.routeContent}>
            <div className={styles.routesList}>
              <Text className={styles.routesTitle}>Rutas disponibles</Text>
              {routes.map((route, index) => (
                <div
                  key={index}
                  className={`${styles.routeOption} ${
                    index === selectedRouteIndex ? styles.routeOptionSelected : ''
                  }`}
                  onClick={() => handleRouteSelect(index)}
                >
                  <Stack gap="xs">
                    <div className={styles.routeInfo}>
                      <div className={styles.routeTime}>
                        <Clock size={16} />
                        <Text>{route.duration}</Text>
                      </div>
                      <div className={styles.routeDistance}>
                        <Navigation size={16} />
                        <Text>{route.distance}</Text>
                      </div>
                    </div>
                    <Text size="sm" color="dimmed">
                      Vía {route.summary}
                    </Text>
                    {route.route.warnings?.length > 0 && (
                      <Badge color="yellow" size="sm">
                        {route.route.warnings[0]}
                      </Badge>
                    )}
                  </Stack>
                </div>
              ))}
            </div>
            <div className={styles.mapWrapper}>
              {isLoading && (
                <div className={styles.mapLoading}>
                  <Loader color="#00ff9d" size="lg" />
                </div>
              )}
              <GoogleMap
                mapContainerStyle={{ 
                  width: '100%', 
                  height: '100%',
                  minHeight: '500px'
                }}
                center={origin?.coords || { lat: 4.6097, lng: -74.0817 }}
                zoom={12}
                options={{
                  ...mapOptions,
                  gestureHandling: 'greedy',
                  zoomControl: true,
                  mapTypeControl: true,
                  scaleControl: true,
                  streetViewControl: false,
                  rotateControl: false,
                  fullscreenControl: true,
                }}
                onLoad={onMapLoad}
              >
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    routeIndex={selectedRouteIndex}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#00ff9d',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                        geodesic: true,
                      },
                      markerOptions: {
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: '#00ff9d',
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                          scale: 7,
                        }
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </div>

          <Button
            className={styles.confirmRouteButton}
            onClick={() => setShowRouteMap(false)}
            disabled={!directions || isLoading}
          >
            Confirmar ruta
          </Button>
        </Modal>
      </Container>
    </Container>
  );
}

export default ReservarView;
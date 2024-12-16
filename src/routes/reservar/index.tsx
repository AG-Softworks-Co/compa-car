import React, { useState, useRef, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, TextInput, Button, Title, Card, Text, Container, Badge, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {  Calendar, User, Car, MapPin, Clock, Navigation } from 'lucide-react';
import PassengerSelector from '../../components/ui/home/PassengerSelector';
import dayjs from 'dayjs';
import { getFromLocalStorage , saveToLocalStorage} from '../../types/PublicarViaje/localStorageHelper';
import styles from './reservar.module.css';
import {  } from './../Reservas/index';
import { TripReservationModal } from './../Reservas/index';
interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}



interface Trip {
  id: string;
  origin: { address: string };
  destination: { address: string };
  dateTime: string;
  seats: number;
  pricePerSeat: number;
  allowPets: boolean;
  allowSmoking: boolean;
  selectedRoute: { duration: string; distance: string };
}
const publishedTrips = getFromLocalStorage<Trip[]>('publishedTrips') || [];

interface SearchFormData {
  origin: string;
  destination: string;
  date: Date | null;
  passengers: number;
}

const ReservarView = () => {
  const navigate = useNavigate(); // Obtén navigate desde el hook
  const [formData, setFormData] = useState<SearchFormData>({
    origin: '',
    destination: '',
    date: null,
    passengers: 1
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [focusedInput, setFocusedInput] = useState<'origin' | 'destination' | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (window.google && !autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
  }, []);

  const handlePlaceSearch = (
    input: string, 
    type: 'origin' | 'destination'
  ) => {
    if (!input.trim() || !autocompleteService.current) {
      type === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const request = {
        input,
        componentRestrictions: { country: 'co' }
      };

      autocompleteService.current?.getPlacePredictions(
        request,
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => ({
              placeId: prediction.place_id,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text,
              fullText: prediction.description
            }));

            type === 'origin' 
              ? setOriginSuggestions(suggestions)
              : setDestinationSuggestions(suggestions);
          }
        }
      );
    }, 300);
  };

  const searchTrips = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);
  
    try {
      // Recupera los datos con un valor predeterminado
   
  
      // Valida que el dato sea un array antes de aplicar .filter
      if (!Array.isArray(publishedTrips)) {
        console.error('El contenido de publishedTrips no es un array.');
        setSearchResults([]);
        return;
      }
  
      // Filtra los datos según los criterios del formulario
      const results = publishedTrips.filter((trip) => {
        const originMatch = trip.origin.address.toLowerCase().includes(formData.origin.toLowerCase());
        const destinationMatch = trip.destination.address.toLowerCase().includes(formData.destination.toLowerCase());
        
        let dateMatch = true;
        if (formData.date) {
          const tripDate = dayjs(trip.dateTime);
          const searchDate = dayjs(formData.date);
          dateMatch = tripDate.isSame(searchDate, 'day');
        }
  
        const seatsMatch = trip.seats >= formData.passengers;
  
        return originMatch && destinationMatch && dateMatch && seatsMatch;
      });
  
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setIsSearching(false);
    }
  };
  

  const handleInputFocus = (type: 'origin' | 'destination') => {
    setFocusedInput(type);
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setFocusedInput(null), 200);
  };

  const handleSuggestionClick = (suggestion: PlaceSuggestion, type: 'origin' | 'destination') => {
    setFormData(prev => ({
      ...prev,
      [type]: suggestion.fullText
    }));
    
    type === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
  };
  const handleReservation = (trip: Trip) => {
    saveToLocalStorage('currentTrip', trip);
    navigate({ to: '/Reservas' });
  };
  return (
    <Container fluid className={styles.container}>
      <Container size="md" className={styles.content}>
        <Box className={styles.searchSection}>
          <Title className={styles.searchTitle}>
            Encuentra tu viaje ideal
            <div className={styles.titleUnderline} />
          </Title>
 
          <Card className={styles.searchCard}>
            <form onSubmit={searchTrips}>
              <div className={styles.searchInputs}>
                {/* Origin Input */}
                <div className={styles.inputWrapper}>
                  <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>
                      <MapPin size={20} />
                    </div>
                    <TextInput
                      className={styles.input}
                      placeholder="¿De dónde sales?"
                      value={formData.origin}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setFormData(prev => ({ ...prev, origin: value }));
                        handlePlaceSearch(value, 'origin');
                      }}
                      onFocus={() => handleInputFocus('origin')}
                      onBlur={handleInputBlur}
                      variant="unstyled"
                      required
                    />
                  </div>
                  {focusedInput === 'origin' && originSuggestions.length > 0 && (
                    <div className={styles.suggestionsContainer}>
                      {originSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          className={styles.suggestionItem}
                          onClick={() => handleSuggestionClick(suggestion, 'origin')}
                          type="button"
                        >
                          <MapPin size={16} className={styles.suggestionIcon} />
                          <div>
                            <Text className={styles.suggestionMain}>{suggestion.mainText}</Text>
                            <Text className={styles.suggestionSecondary}>{suggestion.secondaryText}</Text>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
 
                {/* Destination Input */}
                <div className={styles.inputWrapper}>
                  <div className={styles.inputContainer}>
                    <div className={styles.inputIcon}>
                      <MapPin size={20} />
                    </div>
                    <TextInput
                      className={styles.input}
                      placeholder="¿A dónde vas?"
                      value={formData.destination}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setFormData(prev => ({ ...prev, destination: value }));
                        handlePlaceSearch(value, 'destination');
                      }}
                      onFocus={() => handleInputFocus('destination')}
                      onBlur={handleInputBlur}
                      variant="unstyled"
                      required
                    />
                  </div>
                  {focusedInput === 'destination' && destinationSuggestions.length > 0 && (
                    <div className={styles.suggestionsContainer}>
                      {destinationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          className={styles.suggestionItem}
                          onClick={() => handleSuggestionClick(suggestion, 'destination')}
                          type="button"
                        >
                          <MapPin size={16} className={styles.suggestionIcon} />
                          <div>
                            <Text className={styles.suggestionMain}>{suggestion.mainText}</Text>
                            <Text className={styles.suggestionSecondary}>{suggestion.secondaryText}</Text>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
 
                {/* Date Picker */}
                <div className={styles.inputContainer}>
                  <div className={styles.inputIcon}>
                    <Calendar size={20} className={styles.calendarIcon} />
                  </div>
                  <DatePickerInput
                    className={styles.input}
                    placeholder="¿Cuándo viajas?"
                    value={formData.date}
                    onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                    minDate={new Date()}
                    classNames={{
                      input: styles.dateInput,
                      day: styles.dateDay,
                      weekday: styles.dateWeekday,
                      month: styles.dateMonth
                    }}
                  />
                </div>
 
                {/* Passenger Selector */}
                <div 
                  className={styles.inputContainer} 
                  onClick={() => setShowPassengerSelector(!showPassengerSelector)}
                >
                  <div className={styles.inputIcon}>
                    <User size={20} />
                  </div>
                  <TextInput
                    className={styles.input}
                    value={`${formData.passengers} ${formData.passengers > 1 ? 'Pasajeros' : 'Pasajero'}`}
                    readOnly
                    variant="unstyled"
                    rightSection={
                      <div className={styles.passengerIconWrapper}>
                      {Array.from({ length: formData.passengers }).map((_, i) => (
                        <User key={`passenger-${i}`} size={16} className={styles.passengerIcon} />
                      ))}
                    </div>
                    }
                  />
                </div>
 
                {showPassengerSelector && (
                  <PassengerSelector 
                    value={formData.passengers} 
                    onChange={(num) => {
                      setFormData((prev) => ({ ...prev, passengers: num }));
                      setShowPassengerSelector(false);
                    }} 
                  />
                )}
 
                {/* Search Button */}
                <Button 
                  className={`${styles.searchButton} ${isSearching ? styles.searching : ''}`}
                  type="submit"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className={styles.searchingAnimation}>
                      <Car className={styles.carIcon} size={24} />
                      <div className={styles.road}>
                        <div className={styles.roadLine} />
                        <div className={styles.roadLine} />
                        <div className={styles.roadLine} />
                      </div>
                    </div>
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </Box>
 
        <Box className={styles.resultsSection}>
          <Title className={styles.resultsTitle}>
            Viajes disponibles
          </Title>
          
          {searchResults.length > 0 ? (
            <div className={styles.tripsGrid}>
              {searchResults.map((trip) => (
                <Card key={trip.id} className={styles.tripCard}>
                  <Group gap="apart" mb="md">
                    <Text fw={500} size="lg">
                      {dayjs(trip.dateTime).format('DD MMM YYYY, hh:mm A')}
                    </Text>
                    <Badge color="green" size="lg">
                      ${trip.pricePerSeat.toLocaleString()}
                    </Badge>
                  </Group>
 
                  <div className={styles.tripRoute}>
                    <div>
                      <Text c="dimmed">Origen</Text>
                      <Text>{trip.origin.address}</Text>
                    </div>
                    <div className={styles.routeLine} />
                    <div>
                      <Text c="dimmed">Destino</Text>
                      <Text>{trip.destination.address}</Text>
                    </div>
                  </div>
 
                  <Group mt="md" mb="xs">
                    <Badge leftSection={<Clock size={14} />}>{trip.selectedRoute.duration}</Badge>
                    <Badge leftSection={<Navigation size={14} />}>{trip.selectedRoute.distance}</Badge>
                    <Badge leftSection={<User size={14} />}>{trip.seats} asientos</Badge>
                  </Group>
 
                  <Group gap="apart" mt="lg">
                    <Group>
                      <Badge color={trip.allowPets ? "green" : "red"} variant="light">
                        {trip.allowPets ? "Mascotas permitidas" : "No mascotas"}
                      </Badge>
                      <Badge color={trip.allowSmoking ? "green" : "red"} variant="light">
                        {trip.allowSmoking ? "Fumar permitido" : "No fumar"}
                      </Badge>
                    </Group>
                    <Button 
  variant="light"
  onClick={() => handleReservation(trip)}
>
  Reservar
</Button>
                  </Group>
                </Card>
              ))}
            </div>
          ) : (
            <Text className={styles.resultsSubtitle}>
              {isSearching 
                ? 'Buscando viajes disponibles...' 
                : 'Ingresa los detalles de tu viaje para ver las opciones disponibles'}
            </Text>
          )}
        </Box>
 
        {selectedTrip && (
          <TripReservationModal
            trip={selectedTrip}
            isOpen={reservationModalOpen}
            onClose={() => {
              setReservationModalOpen(false);
              setSelectedTrip(null);
            }}
          />
        )}
      </Container>
    </Container>
  );
};

export const Route = createFileRoute('/reservar/')({
  component: ReservarView
});
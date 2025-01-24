import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, TextInput, Button, Title, Card, Text, Container, Badge, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, User, Car, MapPin, Clock, Navigation } from 'lucide-react';
import PassengerSelector from '../../components/ui/home/PassengerSelector';
import dayjs from 'dayjs';
import { getFromLocalStorage, saveToLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
import styles from './reservar.module.css';
import { TripReservationModal } from '../Reservas/TripReservationModal';

interface PlaceSuggestion {
    placeId: string;
    mainText: string;
    secondaryText: string;
    fullText: string;
}

interface Trip {
    id: string;
    origin: { address: string, secondaryText: string };
    destination: { address: string, secondaryText: string };
    dateTime: string;
    seats: number;
    pricePerSeat: number;
    allowPets: boolean;
    allowSmoking: boolean;
    selectedRoute: { duration: string; distance: string };
}

interface SearchFormData {
    origin: string;
    destination: string;
    date: Date | null;
    passengers: number;
}

const ReservarView = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SearchFormData>(() => {
        // Initialize from localStorage, default to initial state
        const storedFormData = getFromLocalStorage<SearchFormData>('searchFormData');
        if (storedFormData && storedFormData.date) {
            return {
                ...storedFormData,
                date: new Date(storedFormData.date)
            }
        }
         return storedFormData || {
            origin: '',
            destination: '',
            date: null,
            passengers: 1
        };
    });
     const [selectedTrip, setSelectedTrip] = useState<Trip | null>(() => {
           const storedTrip = getFromLocalStorage<Trip | null>('selectedTrip');
           return storedTrip || null;
       });
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showPassengerSelector, setShowPassengerSelector] = useState(false);
    const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<PlaceSuggestion[]>([]);
    const [focusedInput, setFocusedInput] = useState<'origin' | 'destination' | null>(null);
     const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout>();


    useEffect(() => {
        if (window.google && !autocompleteService.current) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
            placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
        }
    }, []);


    useEffect(() => {
        // Save formData to localStorage whenever it changes
          saveToLocalStorage('searchFormData', {
              ...formData,
              date: formData.date ? formData.date.toISOString() : null
          });
    }, [formData]);

     useEffect(() => {
        // Save selectedTrip to localStorage whenever it changes
        saveToLocalStorage('selectedTrip', selectedTrip);
    }, [selectedTrip]);

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


    const fetchPlaceDetails = (placeId: string, type: 'origin' | 'destination') => {
        if (!placesService.current) return;
        placesService.current.getDetails(
            { placeId, fields: ['formatted_address', 'address_components'] },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    const secondaryText = place.address_components?.find(component => component.types.includes('locality'))?.long_name ||
                        place.address_components?.find(component => component.types.includes('administrative_area_level_2'))?.long_name ||
                        place.address_components?.find(component => component.types.includes('administrative_area_level_1'))?.long_name ||
                        place.formatted_address;

                    setFormData(prev => ({
                        ...prev,
                        [type]: secondaryText || place.formatted_address
                    }));
                    type === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
                }
            }
        );
    };

    const searchTrips = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSearching(true);
        setSearchResults([]);
        console.log("formData before API call:", formData);
        try {
            if (!formData.origin || !formData.destination || !formData.date) {
                console.error('Origin, destination, and date are required.');
                setIsSearching(false);
                return;
            }

            const formattedDate = dayjs(formData.date).format('YYYY-MM-DD HH:mm:ss');
            const token = localStorage.getItem('token');
            if (!token) {
                console.error(
                    'No authentication token found in localStorage. Please log in.'
                );
                setIsSearching(false);
                return;
            }

            // Validation Step: Check if the token is valid and non-empty.
            if (typeof token !== 'string' || token.trim() === '') {
                console.error('Invalid or empty token retrieved from localStorage:', token);
                setIsSearching(false);
                return;
            }


            const apiUrl = `https://rest-sorella-production.up.railway.app/api/trips/buscardetalle/${formData.origin}/${formData.destination}/${formattedDate.replace(
                ' ',
                '%20'
            )}`;

            console.log('Request URL:', apiUrl);

            // Logging the Authorization Header for debugging purposes
            const headers = {
                'x-token': token,  // Changed to x-token
                'Content-Type': 'application/json',
            };
            console.log('x-token Header:', headers['x-token'])

            const response = await fetch(apiUrl, {
                headers: headers,
            });
            console.log('Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response Data:', data);

            if (data.data && data.data.length > 0) {
                const trips = data.data.map((item: any) => ({
                    id: item.trip_id,
                    origin: {
                        address: item.secondary_text_origen,
                        secondaryText: item.secondary_text_origen,
                    },
                    destination: {
                        address: item.secondary_text_destination,
                        secondaryText: item.secondary_text_destination,
                    },
                    dateTime: item.date_time,
                    seats: item.seats,
                    pricePerSeat: Number(item.price_per_seat),
                    allowPets: Boolean(item.allow_pets),
                    allowSmoking: Boolean(item.allow_smoking),
                    selectedRoute: {
                        duration: item.duration,
                        distance: item.distance,
                    },
                }));

                setSearchResults(trips);
                console.log(trips);
            } else {
                setSearchResults([]);
            }
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
        fetchPlaceDetails(suggestion.placeId, type);
    };
       const handleReservation = (trip: Trip) => {
        setSelectedTrip(trip);
        saveToLocalStorage('currentTrip', trip);
        navigate({ to: '/Reservas' });
    };


     const handleCloseModal = () => {
        setReservationModalOpen(false);
    };

    return (
          <Container fluid className={styles.container}>
              <div className={styles.logoOverlay}></div>
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
                                           className={styles.reserveButton}
                                           onClick={() => {
                                               handleReservation(trip)
                                                setReservationModalOpen(true)

                                            }}
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
                         onClose={handleCloseModal}
                    />
                )}
            </Container>
        </Container>
    );
};

export const Route = createFileRoute('/reservar/')({
    component: ReservarView
});
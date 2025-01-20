// Cupos.tsx
import React, { useState, useEffect } from 'react';
import { Container, Title, Text, LoadingOverlay, Card, Group, Stack, List ,Button,  } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router';
import { Booking, Passenger } from '../../components/Cupos/types';
import ViewBookingDetails from './ViewBookingDetails';
import ViewPassengers from './ViewPassengers';

interface CuposProps {
userId: number;
token: string;
}
interface LocationState {
    selectedBooking?: Booking;
     showPassengers?: boolean
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const Cupos: React.FC<CuposProps> = ({ userId, token }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
     const [showPassengers, setShowPassengers] = useState(false);
    const location = useLocation();


    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/bookings/userid/${userId}`, {
                    headers: { 'x-token': token },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching bookings:', errorData);
                    showNotification({
                        title: 'Error al obtener las reservas',
                        message: `Hubo un error al cargar las reservas desde el servidor. Detalle: ${
                            errorData.msj || 'Desconocido'
                        }`,
                        color: 'red',
                    });
                    setLoading(false);
                    return;
                }

                const responseData = await response.json();
                if (!responseData.data || !Array.isArray(responseData.data)) {
                    console.error('Invalid response from API: data array not found', responseData);
                    showNotification({
                        title: 'Error al obtener las reservas',
                        message: 'La respuesta del servidor no tiene el formato esperado.',
                        color: 'red',
                    });
                    setLoading(false);
                    return;
                }

                const bookingsData = responseData.data;
                const bookingsWithPassengers = await Promise.all(
                    bookingsData.map(async (bookingData: any): Promise<Booking> => {
                        try {
                            const passengersResponse = await fetch(
                                `${BASE_URL}/passengers/bookingid/${bookingData.booking_id}`,
                                {
                                    headers: { 'x-token': token },
                                }
                            );
                            if (passengersResponse.ok) {
                                const passengersData = await passengersResponse.json();
                                return {
                                    ...bookingData,
                                    passengers: passengersData.data || [],
                                    trip_id: bookingData.trip_id,
                                    booking_date: bookingData.booking_date,
                                    booking_status: bookingData.booking_status,
                                    total_price: bookingData.total_price,
                                };
                            } else {
                                console.log('Error fetching passengers for booking:', bookingData.booking_id);
                                return { ...bookingData, passengers: [], trip_id: bookingData.trip_id,
                                    booking_date: bookingData.booking_date,
                                    booking_status: bookingData.booking_status,
                                    total_price: bookingData.total_price, };
                            }
                        } catch (error) {
                            console.error('error fetching passengers', error);
                            return { ...bookingData, passengers: [],  trip_id: bookingData.trip_id,
                            booking_date: bookingData.booking_date,
                            booking_status: bookingData.booking_status,
                            total_price: bookingData.total_price };
                        }
                    })
                );

                setBookings(bookingsWithPassengers);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                showNotification({
                    title: 'Error al obtener las reservas',
                    message:
                        'Hubo un error al cargar las reservas desde el servidor. Intenta de nuevo más tarde.',
                    color: 'red',
                });
                setLoading(false);
            }
        };

        fetchBookings();
        // Restore selected booking and passenger view state from location
         const locationState = location.state as LocationState;
       if(locationState){
             setSelectedBooking(locationState.selectedBooking);
             setShowPassengers(locationState.showPassengers || false)
       }
    }, [userId, token, location.state]);


    if (loading) {
        return (
            <Container className={styles.container}>
                <LoadingOverlay visible />
                <Title className={styles.title}>Mis Cupos</Title>
                <Text className={styles.noTripsText}>Cargando tus cupos...</Text>
            </Container>
        );
    }

    return (
        <Container className={styles.container}>
             <Title className={styles.title}>Mis Cupos Comprados</Title>
            {bookings.length === 0 ? (
                <Text className={styles.noTripsText}>Aún no has comprado ningún cupo.</Text>
            ) : (
                 <>
                  <Stack gap="xl">
                    {bookings.map((booking) => (
                        <Card key={booking.booking_id} className={styles.cupoCard} style={{  borderRadius: '12px', marginBottom:'15px', background: 'linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(0, 255, 157, 0.1)', boxShadow:'0 4px 10px rgba(0, 255, 157, 0.05)' }}>
                            <Stack gap="xs">
                                 <Group gap="apart">
                                    <Text fw={600} style={{color:"#ddd"}}>ID de la reserva:</Text>
                                    <Text style={{color:"#fff"}}>{booking.booking_id}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Text fw={600} style={{color:"#ddd"}}>ID del viaje:</Text>
                                    <Text style={{color:"#fff"}}>{booking.trip_id}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Text fw={600} style={{color:"#ddd"}}>Fecha de reserva:</Text>
                                    <Text style={{color:"#fff"}}>{dayjs(booking.booking_date).format('DD/MM/YYYY HH:mm')}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Text fw={600} style={{color:"#ddd"}}>Estado del viaje:</Text>
                                     <Text style={{color:"#fff"}}>{booking.booking_status}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Text fw={600} style={{color:"#ddd"}}>Precio Total:</Text>
                                    <Text style={{color:"#fff"}}>${booking.total_price.toLocaleString()}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Button
                                        size="xs"
                                        onClick={() => setSelectedBooking(booking)}
                                          style={{
                                                backgroundColor: 'transparent',
                                                color: '#34D399',
                                                borderRadius: '6px',
                                                border: '1px solid #34D399',
                                                padding: '5px 10px',
                                                transition: 'background-color 0.3s, color 0.3s',
                                                  '&:hover': {
                                                    backgroundColor: '#34D399',
                                                      color: 'black'
                                                  },
                                            }}
                                    >
                                        Ver Detalles
                                    </Button>
                                    <Button
                                        size="xs"
                                         style={{
                                                backgroundColor: 'transparent',
                                                color: '#34D399',
                                                borderRadius: '6px',
                                                border: '1px solid #34D399',
                                                padding: '5px 10px',
                                                transition: 'background-color 0.3s, color 0.3s',
                                                  '&:hover': {
                                                     backgroundColor: '#34D399',
                                                       color: 'black'
                                                  },
                                            }}
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setShowPassengers(true);
                                        }}
                                    >
                                        Ver Pasajeros
                                    </Button>
                                </Group>
                            </Stack>
                        </Card>
                    ))}
                  </Stack>
                   <div style={{marginTop: '30px'}}>
                        {selectedBooking && !showPassengers && (
                                 <ViewBookingDetails
                                   booking={selectedBooking}
                                   onClose={() => setSelectedBooking(undefined)}
                                   token={token} // Pass the token here
                                  />
                             )}


                         {selectedBooking && showPassengers && (
                                <ViewPassengers
                                   booking={selectedBooking}
                                    onClose={() => {
                                       setSelectedBooking(undefined);
                                       setShowPassengers(false)
                                    }}
                               />
                          )}
                    </div>
                 </>
            )}


        </Container>
    );
};

export const Route = createFileRoute('/Cupos/')({
component: Cupos,
});

export default Cupos;
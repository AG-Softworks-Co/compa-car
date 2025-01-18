// Cupos.tsx
import React, { useState, useEffect } from 'react';
import { Container, Title, Text, LoadingOverlay, Card, Group, Stack, List ,Button} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { createFileRoute } from '@tanstack/react-router';
import { Booking, Passenger } from '../../components/Cupos/types';
import ViewBookingDetails from './ViewBookingDetails';
import ViewPassengers from './ViewPassengers';

interface CuposProps {
userId: number;
token: string;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const Cupos: React.FC<CuposProps> = ({ userId, token }) => {
const [bookings, setBookings] = useState<Booking[]>([]);
const [loading, setLoading] = useState(true);
const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
const [showPassengers, setShowPassengers] = useState(false);

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
}, [userId, token]);

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
            <Stack gap="xl">
                {bookings.map((booking) => (
                    <Card key={booking.booking_id} className={styles.cupoCard}>
                        <Stack gap="xs">
                             <Group gap="apart">
                                <Text fw={600}>ID de la reserva:</Text>
                                <Text>{booking.booking_id}</Text>
                            </Group>
                            <Group gap="apart">
                                <Text fw={600}>ID del viaje:</Text>
                                <Text>{booking.trip_id}</Text>
                            </Group>
                            <Group gap="apart">
                                <Text fw={600}>Fecha de reserva:</Text>
                                <Text>{dayjs(booking.booking_date).format('DD/MM/YYYY HH:mm')}</Text>
                            </Group>
                            <Group gap="apart">
                                <Text fw={600}>Estado del viaje:</Text>
                                <Text>{booking.booking_status}</Text>
                            </Group>
                            <Group gap="apart">
                                <Text fw={600}>Precio Total:</Text>
                                <Text>${booking.total_price.toLocaleString()}</Text>
                            </Group>
                            <Group gap="apart">
                                <Button 
                                    size="xs" 
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    Ver Detalles
                                </Button>
                                <Button 
                                    size="xs"
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
        )}

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
                    setShowPassengers(false);
                }} 
            />
        )}
    </Container>    
);

};

export const Route = createFileRoute('/Cupos/')({
component: Cupos,
});

export default Cupos;
import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    Card,
    Group,
    Stack,
    Text,
    Badge,
    Modal,
    NumberInput,
    TextInput,
    Button,
    Center,
} from '@mantine/core';
import { Clock, Navigation, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';
import styles from './index.module.css';

interface Trip {
    id: string;
    origin: { address: string; secondaryText: string };
    destination: { address: string; secondaryText: string };
    dateTime: string;
    seats: number;
    pricePerSeat: number;
    allowPets: boolean;
    allowSmoking: boolean;
    selectedRoute: {
        duration: string;
        distance: string;
    };
}

interface Passenger {
    fullName: string;
    identificationNumber: string;
}

interface TripReservationModalProps {
    trip: Trip;
    isOpen: boolean;
    onClose: () => void;
}

export const TripReservationModal: React.FC<TripReservationModalProps> = ({ trip, isOpen, onClose }) => {
    const [passengersCount, setPassengersCount] = React.useState(1);
    const [passengers, setPassengers] = React.useState<Passenger[]>([]);
    const [currentStep, setCurrentStep] = React.useState<'confirm' | 'passengers' | 'finalize'>('confirm');
    const [bookingId, setBookingId] = React.useState<number | null>(null);

    const handleConfirmReservation = async () => {
        const userId = localStorage.getItem('userId');
    
        if (!userId) {
            console.error('No se encontró el ID del usuario en localStorage. Por favor, inicia sesión.');
            return;
        }
    
        if (passengersCount < 1 || passengersCount > trip.seats) {
            console.error('Cantidad de asientos inválida. Por favor, verifica los campos.');
            return;
        }
    
        const bookingQr = `${trip.id}-${userId}-${Date.now()}`;
        const bookingData = {
            trip_id: Number(trip.id), // Convertir a número si es string
            user_id: userId,
            seats_booked: passengersCount,
            total_price: passengersCount * trip.pricePerSeat,
            booking_status: 'pending',
            booking_qr: bookingQr,
            booking_date: dayjs().toISOString(),
        };
    
        try {
            const { data: bookings, error: bookingError } = await supabase
                .from('bookings')
                .insert(bookingData)
                .select();
    
            if (bookingError) {
                console.error('Error al crear la reserva en bookings:', bookingError);
                return;
            }
    
            const booking = bookings?.[0];
            if (!booking) {
                console.error('No se pudo obtener el booking después de la inserción.');
                return;
            }
    
            console.log('Reserva creada con éxito en bookings:', booking);
            setBookingId(booking.id); // Guardar el ID del booking
            setPassengers(Array(passengersCount).fill({ fullName: '', identificationNumber: '' }));
            setCurrentStep('passengers');
        } catch (error) {
            console.error('Error al procesar la reserva:', error);
        }
    };

    const handleSavePassengers = () => {
        // Validar que todos los pasajeros tengan datos completos
        for (const passenger of passengers) {
            if (!passenger.fullName || !passenger.identificationNumber) {
                console.error('Todos los pasajeros deben tener nombre e identificación.');
                return;
            }
        }

        setCurrentStep('finalize'); // Pasar a la subvista de confirmación
    };

    const handleFinalizeReservation = async () => {
        if (!bookingId) {
            console.error('No se encontró el ID del booking. No se puede continuar.');
            return;
        }
    
        const userId = localStorage.getItem('userId'); // Asegúrate de obtener userId aquí
    
        if (!userId) {
            console.error('No se encontró el ID del usuario en localStorage. Por favor, inicia sesión.');
            return;
        }
    
        try {
            console.log('Intentando actualizar el estado del booking con ID:', bookingId);
    
            // Actualizar el estado del booking a "reserved"
            const { data: updatedBooking, error: bookingUpdateError } = await supabase
                .from('bookings')
                .update({ booking_status: 'reserved' })
                .eq('id', bookingId)
                .select();
    
            if (bookingUpdateError) {
                console.error('Error al actualizar el estado del booking:', bookingUpdateError);
                return;
            }
    
            console.log('Estado del booking actualizado a "reserved":', updatedBooking);
    
            // Actualizar los asientos disponibles en la tabla trips
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .select('seats, seats_reserved')
                .eq('id', Number(trip.id)) // Asegúrate de que trip.id sea un número
                .single();
    
            if (tripError || !tripData) {
                console.error('Error al obtener los datos del viaje:', tripError);
                return;
            }
    
            if (tripData.seats === null) {
                console.error('El número de asientos no está disponible.');
                return;
            }
    
            // Calcular los nuevos valores de seats_reserved y seats
            const newSeatsReserved = (tripData.seats_reserved || 0) + passengersCount;
            const newSeatsAvailable = tripData.seats - passengersCount;
    
            // Actualizar los valores en la tabla trips
            const { error: tripUpdateError } = await supabase
                .from('trips')
                .update({ seats_reserved: newSeatsReserved, seats: newSeatsAvailable })
                .eq('id', Number(trip.id));
    
            if (tripUpdateError) {
                console.error('Error al actualizar los asientos del viaje:', tripUpdateError);
                return;
            }
    
            console.log('Asientos actualizados en el viaje:', {
                seats_reserved: newSeatsReserved,
                seats: newSeatsAvailable,
            });
    
            // Insertar los pasajeros en la tabla booking_passengers
            const passengerData = passengers.map((passenger) => ({
                booking_id: bookingId,
                full_name: passenger.fullName,
                identification_number: passenger.identificationNumber,
                user_id: userId, // Ahora userId está definido
                status: 'confirmed',
            }));
    
            const { error: passengerError } = await supabase
                .from('booking_passengers')
                .insert(passengerData);
    
            if (passengerError) {
                console.error('Error al crear los pasajeros en booking_passengers:', passengerError);
                return;
            }
    
            console.log('Pasajeros creados con éxito en booking_passengers');
            setCurrentStep('confirm');
            onClose();
        } catch (error) {
            console.error('Error al procesar la reserva:', error);
        }
    };

    const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
        setPassengers((prevPassengers) => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[index] = {
                ...updatedPassengers[index],
                [field]: value,
            };
            return updatedPassengers;
        });
    };

    return (
        <>
            <Modal
                opened={isOpen && currentStep === 'confirm'}
                onClose={onClose}
                title="Reservar Viaje"
                size="lg"
                centered
                closeOnClickOutside={false}
            >
                <Stack gap="xl">
                    <Center>
                        <Card className={styles.tripSummary} shadow="sm" withBorder>
                            <Group gap="apart">
                                <Text fw={500} size="lg">
                                    {dayjs(trip.dateTime).format('DD MMM YYYY, hh:mm A')}
                                </Text>
                                <Badge color="green" size="lg">
                                    ${trip.pricePerSeat.toLocaleString()} / asiento
                                </Badge>
                            </Group>

                            <div className={styles.routeInfo}>
                                <Text c="dimmed" size="sm">
                                    Origen
                                </Text>
                                <Text fw={500}>{trip.origin.address}</Text>
                                <div className={styles.routeDivider} />
                                <Text c="dimmed" size="sm">
                                    Destino
                                </Text>
                                <Text fw={500}>{trip.destination.address}</Text>
                            </div>

                            <Group mt="md">
                                <Badge leftSection={<Clock size={14} />}>
                                    {trip.selectedRoute.duration}
                                </Badge>
                                <Badge leftSection={<Navigation size={14} />}>
                                    {trip.selectedRoute.distance}
                                </Badge>
                                <Badge leftSection={<User size={14} />}>
                                    {trip.seats} disponibles
                                </Badge>
                            </Group>
                        </Card>
                    </Center>

                    <NumberInput
                        label="Número de asientos"
                        description="Selecciona cuántos asientos deseas reservar"
                        value={passengersCount}
                        onChange={(val) => setPassengersCount(Number(val))}
                        min={1}
                        max={trip.seats}
                        required
                        error={
                            passengersCount > trip.seats
                                ? 'No hay suficientes asientos disponibles'
                                : null
                        }
                    />

                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleConfirmReservation}
                        className={styles.confirmButton}
                    >
                        Confirmar Reserva
                    </Button>
                </Stack>
            </Modal>

            <Modal
                opened={isOpen && currentStep === 'passengers'}
                onClose={onClose}
                title="Datos de los Pasajeros"
                size="lg"
                centered
                closeOnClickOutside={false}
            >
                <Stack gap="xl">
                    {passengers.map((passenger, index) => (
                        <Card key={index} shadow="sm" withBorder>
                            <Text fw={500}>Pasajero {index + 1}</Text>
                            <TextInput
                                label="Nombre completo"
                                placeholder="Ej: Juan Pérez"
                                value={passenger.fullName}
                                onChange={(e) =>
                                    handlePassengerChange(index, 'fullName', e.currentTarget.value)
                                }
                                required
                            />
                            <TextInput
                                label="Número de identificación"
                                placeholder="Ej: 123456789"
                                value={passenger.identificationNumber}
                                onChange={(e) =>
                                    handlePassengerChange(index, 'identificationNumber', e.currentTarget.value)
                                }
                                required
                            />
                        </Card>
                    ))}

                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleSavePassengers}
                        className={styles.confirmButton}
                    >
                        Confirmar Pasajeros
                    </Button>
                </Stack>
            </Modal>

            <Modal
                opened={isOpen && currentStep === 'finalize'}
                onClose={onClose}
                title="Confirmar Reserva"
                size="lg"
                centered
                closeOnClickOutside={false}
            >
                <Stack gap="xl">
                    <Text>
                        Está a punto de confirmar su reserva. Recuerde que debe realizar el pago
                        directamente con el conductor (en efectivo, Nequi o Bancolombia).
                    </Text>
                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleFinalizeReservation}
                        className={styles.confirmButton}
                    >
                        Reservar
                    </Button>
                </Stack>
            </Modal>
        </>
    );
};

export const Route = createFileRoute('/Reservas/TripReservationModal')({
    component: TripReservationModal,
});
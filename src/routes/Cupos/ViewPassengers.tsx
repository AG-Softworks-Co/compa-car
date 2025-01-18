import React from 'react';
import { Card, Stack, Text, List, Button, Group } from '@mantine/core';
import styles from './ViewPassengers.module.css';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Booking, Passenger } from '../../components/Cupos/types';

// Definir los props que se esperan para el componente
interface ViewPassengersProps {
    booking?: Booking; // Objeto de reserva que contiene pasajeros
    onClose: () => void; // Función para cerrar la vista
}

const ViewPassengers: React.FC<ViewPassengersProps> = ({ booking, onClose }) => {
    const navigate = useNavigate();

    // Verificar si no hay pasajeros en la reserva
    if (!booking || !booking.passengers || booking.passengers.length === 0) return null;

    // Manejar la navegación al ticket de un pasajero específico
     const handleViewTicket = (passenger: Passenger) => {
        navigate({
            to: `/Cupos/ViewTicket`, // Correct URL: No ID in the path
             state: { booking, passenger } // Pass booking and passenger data in state
        });
    };

    return (
        <Card className={styles.detailsCard} withBorder shadow="sm">
            <Stack gap="xs">
                <Text fw={600} size="lg" mb="md" ta="center">
                    Pasajeros
                </Text>
                <List type="ordered">
                    {booking.passengers.map((passenger) => (
                        <List.Item key={passenger.passenger_id}>
                            <Group justify="space-between" align="center">
                                <Stack>
                                    <Text>Nombre: {passenger.full_name}</Text>
                                    <Text>Identificación: {passenger.identification_number}</Text>
                                    <Text size="sm" c="dimmed">QR: {passenger.booking_qr}</Text>
                                </Stack>
                                <Button size="xs" onClick={() => handleViewTicket(passenger)}>
                                    Ver Ticket
                                </Button>
                            </Group>
                        </List.Item>
                    ))}
                </List>
                <Button onClick={onClose} mt="md" size="xs" fullWidth>
                    Cerrar Pasajeros
                </Button>
            </Stack>
        </Card>
    );
};

// Crear la ruta usando createFileRoute
export const Route = createFileRoute('/Cupos/ViewPassengers')({
    component: ViewPassengers,
});

export default ViewPassengers;
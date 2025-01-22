import React, { useState, useEffect } from 'react';
import { Text, LoadingOverlay, Table, ScrollArea, Badge, Button, Center, Container, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import styles from './index.module.css';

// Define proper types
export interface BookedPassenger {
    passenger_id: number;
    trip_id: number;
    full_name: string;
    identification_number: string;
    payment_status: 'completed' | 'pending';
}

interface CuposReservadosProps {
    tripId: number;
    token: string;
    userId: number;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const CuposReservadosComponent: React.FC<CuposReservadosProps> = ({ tripId, token, userId }) => {
    const [allPassengers, setAllPassengers] = useState<BookedPassenger[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredPassengers, setFilteredPassengers] = useState<BookedPassenger[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPassengers = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${BASE_URL}/passengers/userid_trip_det/${userId}`,
                    {
                        headers: {
                            'x-token': token,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    showNotification({
                        title: 'Error al obtener los pasajeros',
                        message: `Error: ${errorData.msj || 'Desconocido'}`,
                        color: 'red',
                    });
                    return;
                }

                const responseData = await response.json();
                if (responseData.ok && responseData.data) {
                    setAllPassengers(responseData.data);
                }
            } catch (error) {
                showNotification({
                    title: 'Error al obtener los pasajeros',
                    message: 'Error al cargar los pasajeros. Intente nuevamente.',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPassengers();
    }, [userId, token]);

    useEffect(() => {
        const filtered = allPassengers.filter((passenger) => passenger.trip_id === tripId);
        setFilteredPassengers(filtered);
    }, [allPassengers, tripId]);

    const handleValidateCupo = (passenger: BookedPassenger) => {
        navigate({ 
            to: '/CuposReservados/ValidarCupo',
            search: {
              passengerId: String(passenger.passenger_id),
              token: token,
              userId: String(userId)
            }
          });
    };

    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <LoadingOverlay visible={true} />
            </Center>
        );
    }

    if (!filteredPassengers.length) {
        return (
            <Container className={styles.container}>
                <Center>
                    <Text size="lg">
                        No hay pasajeros registrados para este viaje.
                    </Text>
                </Center>
            </Container>
        );
    }

    return (
        <Container className={styles.container}>
            <Title order={2} mb="lg">Cupos Reservados - Viaje {tripId}</Title>
            <ScrollArea>
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Identificación</th>
                            <th>Estado de Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPassengers.map((passenger) => (
                            <tr key={passenger.passenger_id}>
                                <td>{passenger.full_name}</td>
                                <td>{passenger.identification_number}</td>
                                <td>
                                    <Badge 
                                        color={passenger.payment_status === 'completed' ? 'green' : 'red'}
                                    >
                                        {passenger.payment_status === 'completed' ? 'Pagado' : 'Pendiente'}
                                    </Badge>
                                </td>
                                <td>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleValidateCupo(passenger)}
                                    >
                                        Validar Cupo
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </ScrollArea>
        </Container>
    );
};

export const Route = createFileRoute('/CuposReservados/')({
    component: CuposReservadosComponent,
});

export default CuposReservadosComponent;
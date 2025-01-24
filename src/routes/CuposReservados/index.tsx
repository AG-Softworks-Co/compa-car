import type React from 'react';
import { useState, useEffect } from 'react';
import { Text, Center, Container, Title, Group, Button, Badge } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { IconX } from '@tabler/icons-react';
import styles from './index.module.css';

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
        const response = await fetch(`${BASE_URL}/passengers/userid_trip_det/${userId}`, {
          headers: {
            'x-token': token,
            'Content-Type': 'application/json',
          },
        });

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
      to: '/CuposReservados/ValidarCupo/$passengerId/$token/$userId',
      params: {
        passengerId: passenger.passenger_id.toString(),
        token: token,
        userId: userId.toString()
      },
    });
  };

  const handleClose = () => {
    navigate({ to: '/' });
  };

  return (
    <Container className={styles.container}>
      <Group gap="apart" mb="md" className={styles.headerGroup}>
        <Title order={2} className={styles.title}>
          Cupos Reservados - Viaje {tripId}
        </Title>
        <Button variant="subtle" color="gray" onClick={handleClose} className={styles.closeButton}>
          <IconX size={20} stroke={2} className={styles.closeIcon} />
        </Button>
      </Group>
      <div className={styles.passengersContainer}>
        {loading ? (
          <Center>
            <Text className={styles.loadingText}>Cargando...</Text>
          </Center>
        ) : filteredPassengers.length > 0 ? (
          filteredPassengers.map((passenger) => (
            <div key={passenger.passenger_id} className={styles.passengerCard}>
              <Group gap="apart" className={styles.passengerHeader}>
                <Text fw={700} className={styles.passengerName}>
                  {passenger.full_name}
                </Text>
                <Badge
                  className={styles.badge}
                  color={passenger.payment_status === 'completed' ? 'green' : 'red'}
                  variant="filled"
                >
                  {passenger.payment_status === 'completed' ? 'Pagado' : 'Pendiente'}
                </Badge>
              </Group>
              <Text size="sm" className={styles.passengerId}>
                ID: {passenger.identification_number}
              </Text>
              <Button
                variant="light"
                className={styles.validateButton}
                onClick={() => handleValidateCupo(passenger)}
              >
                Validar Cupo
              </Button>
            </div>
          ))
        ) : (
          <Center>
            <Text size="lg" className={styles.noTripsText}>
              No hay pasajeros registrados para este viaje.
            </Text>
          </Center>
        )}
      </div>
    </Container>
  );
};

export const Route = createFileRoute('/CuposReservados/')({
  component: CuposReservadosComponent,
});

export default CuposReservadosComponent;


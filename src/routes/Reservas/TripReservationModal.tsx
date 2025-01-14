import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Modal,
  NumberInput,
  Textarea,
  Divider,
  Button,
  Center,
} from '@mantine/core';
import { Clock, Navigation, User, Check } from 'lucide-react';
import { saveToLocalStorage, getFromLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
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

interface ReservationData {
  tripId: string;
  passengersCount: number;
  totalPrice: number;
  comment: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface TripReservationModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const TripReservationModal: React.FC<TripReservationModalProps> = ({ trip, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [passengersCount, setPassengersCount] = React.useState(1);
  const [comment, setComment] = React.useState('');
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleSubmit = () => {
    const reservation: ReservationData = {
      tripId: trip.id,
      passengersCount,
      totalPrice: passengersCount * trip.pricePerSeat,
      comment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existingReservations = getFromLocalStorage<ReservationData[]>('tripReservations') || [];
    saveToLocalStorage('tripReservations', [...existingReservations, reservation]);
    saveToLocalStorage('currentReservation', reservation);

    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      navigate({ to: '/PagarCupo' });
    }, 2000);
  };

  return (
    <>
      <Modal
        opened={isOpen && !showConfirmation}
        onClose={onClose}
        title="Reservar Viaje"
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        <Stack gap="xl">
           <Center>
              <Card className={styles.tripSummary} shadow="sm" withBorder >
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

            <Group mt="md">
              <Badge color={trip.allowPets ? 'green' : 'red'} variant="light">
                {trip.allowPets ? 'Mascotas permitidas' : 'No mascotas'}
              </Badge>
              <Badge color={trip.allowSmoking ? 'green' : 'red'} variant="light">
                {trip.allowSmoking ? 'Fumar permitido' : 'No fumar'}
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

          <Card className={styles.priceCard} shadow="sm" withBorder>
            <Group gap="apart">
              <Text>Precio por asiento</Text>
              <Text>${trip.pricePerSeat.toLocaleString()}</Text>
            </Group>
            <Group gap="apart">
              <Text>Cantidad de asientos</Text>
              <Text>{passengersCount}</Text>
            </Group>
            <Divider my="sm" />
            <Group gap="apart" style={{ fontSize: '1.2em' }}>
              <Text fw={500}>Total a pagar</Text>
              <Text fw={700} color="green">
                ${(passengersCount * trip.pricePerSeat).toLocaleString()}
              </Text>
            </Group>
          </Card>

          <Textarea
            label="Mensaje para el conductor"
            description="Opcional: Añade información adicional sobre tu viaje"
            placeholder="Ej: Llevo una maleta mediana..."
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={3}
          />

          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            className={styles.confirmButton}
            disabled={passengersCount > trip.seats}
          >
            Confirmar Reserva
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={showConfirmation}
        onClose={() => {}}
        withCloseButton={false}
        centered
        closeOnClickOutside={false}
      >
        <Stack align="center" py="xl">
          <div className={styles.successIcon}>
            <Check size={32} />
          </div>
          <Text size="lg" fw={600} ta="center">
            ¡Reserva enviada con éxito!
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Serás redirigido al pago
          </Text>
        </Stack>
      </Modal>
    </>
  );
};

export const Route = createFileRoute('/Reservas/TripReservationModal')({
  component: TripReservationModal,
});
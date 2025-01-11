import React from 'react';
import { Group, Text, Badge, Button } from '@mantine/core';
import { Navigation, Clock, Users, DollarSign, Edit, Trash } from 'lucide-react';
import styles from './SrylesComponents/TripCard.module.css';
import { Trip } from './Actividades';

interface TripCardProps {
    trip: Trip;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, index, onEdit, onDelete }) => {
  return (
    <div key={trip.id} className={styles.tripCard}>
      <Group gap="apart" align="flex-start">
        <div>
          <Text className={styles.tripTitle}>#{index + 1} - Origen</Text>
          <Text className={styles.tripText}>{trip.origin.address}</Text>
          <Text className={styles.tripTitle}>Destino</Text>
          <Text className={styles.tripText}>{trip.destination.address}</Text>
        </div>
        <Badge
          color={trip.is_active ? 'green' : 'red'}
          className={styles.tripBadge}
        >
          {trip.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      </Group>
      <Badge color="green" className={styles.tripBadge}>
        {trip.date} {trip.time}
      </Badge>
      <Group gap="xs" className={styles.tripInfoGroup}>
        <Badge leftSection={<Clock size={14} />}>{trip.duration}</Badge>
        <Badge leftSection={<Navigation size={14} />}>{trip.distance}</Badge>
        <Badge leftSection={<Users size={14} />}>{trip.seats} Asientos</Badge>
        <Badge leftSection={<DollarSign size={14} />}>
          {trip.pricePerSeat} COP/Asiento
        </Badge>
      </Group>
      <Text size="sm" c="dimmed" className={styles.tripSummary}>
        {trip.description || 'Sin descripción'}
      </Text>
      <Group gap="sm" className={styles.tripActions}>
        <Button
          size="xs"
          variant="outline"
          color="blue"
          leftSection={<Edit size={16} />}
          onClick={onEdit}
        >
          Editar
        </Button>
        <Button
          size="xs"
          variant="outline"
          color="red"
          leftSection={<Trash size={16} />}
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </Group>
    </div>
  );
};

export default TripCard;
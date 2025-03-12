import React from 'react';
import TripCard from './TripCard';
import { Stack, Text } from '@mantine/core';
import styles from './index.module.css';
import type { Trip } from './Actividades.tsx';

interface TripListProps {
  trips: Trip[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}


const TripList: React.FC<TripListProps> = ({ trips, onEdit, onDelete }) => {
  if (trips.length === 0) {
    return (
        <Text className={styles.noTripsText}>
            No se encontraron viajes con el filtro seleccionado.
        </Text>
      );
  }
    
  return (
    <Stack gap="lg">
       {trips.map((trip, index) => (
          <TripCard
            token=''
            userId={'0'}
            key={trip.id}
            trip={trip}
            onEdit={() => onEdit(index)}
            onDelete={() => onDelete(index)}
          />
        ))}
    </Stack>
  );
};

export default TripList;
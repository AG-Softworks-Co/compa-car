import type React from 'react';
import { useState, useEffect } from 'react';
import { Group, Text, Badge, Button, ActionIcon, Modal, useMantineTheme } from '@mantine/core';
import { Navigation, Clock, Users, DollarSign, Edit, Trash, Bell } from 'lucide-react';
import styles from './SrylesComponents/TripCard.module.css';
import type { Trip } from './Actividades';
import type { BookedPassenger } from '../../components/Cupos/types';
import CuposReservados from '../../routes/CuposReservados';
import { supabase } from '@/lib/supabaseClient';

interface TripCardProps {
    trip: Trip;
    onEdit: () => void;
    onDelete: () => void;
    token: string;
    userId: string;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete, token, userId }) => {
    const [cuposModalOpen, setCuposModalOpen] = useState(false);
    const [passengerCount, setPassengerCount] = useState(0);
    const theme = useMantineTheme();

    useEffect(() => {
        const fetchPassengerCount = async () => {
            try {
                const { data, error } = await supabase
                    .from('booking_passengers')
                    .select('count')
                    .eq('trip_id', trip.id)
                    .single();

                if (error) throw error;
                setPassengerCount(data?.count || 0);
            } catch (error) {
                console.error('Error fetching passenger count:', error);
            }
        };

        fetchPassengerCount();
    }, [trip.id]);

    const handleCuposClick = () => {
        setCuposModalOpen(true);
    };

    const handleCloseCuposModal = () => {
        setCuposModalOpen(false);
    };

    return (
        <div key={trip.id} className={styles.tripCard}>
            <div className={styles.tripHeader}>
                 <Badge
                     color={trip.is_active ? 'green' : 'red'}
                     className={styles.tripBadge}
                 >
                    {trip.is_active ? 'Activo' : 'Inactivo'}
                 </Badge>
                 <div className={styles.tripActionsIcons}>
                     <ActionIcon
                        variant="outline"
                        color="blue"
                        onClick={onEdit}
                     >
                        <Edit size={16} />
                     </ActionIcon>
                    <ActionIcon
                       variant="outline"
                       color="red"
                       onClick={onDelete}
                   >
                        <Trash size={16} />
                    </ActionIcon>
                </div>
            </div>
            <div>
                <Text className={styles.tripTitle}>Origen</Text>
                <Text className={styles.tripText}>{trip.origin.address}</Text>
                <Text className={styles.tripTitle}>Destino</Text>
                <Text className={styles.tripText}>{trip.destination.address}</Text>
            </div>

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
                    onClick={handleCuposClick}
                    leftSection={passengerCount > 0 &&  <Bell size={16} color={theme.colors.blue[6]} /> }
                   rightSection={passengerCount > 0 && <Badge color="blue" size="xs">{passengerCount}</Badge>}
                >
                   Cupos Comprados
                </Button>
                <Button
                    size="xs"
                    variant="outline"
                    color="green"
                >
                   Empezar Viaje
                </Button>
            </Group>
            <Modal
            opened={cuposModalOpen}
            onClose={handleCloseCuposModal}
        
            >
              <CuposReservados tripId={Number(trip.id)} token={token} userId={Number(userId)}/>
            </Modal>
        </div>
    );
};

export default TripCard;
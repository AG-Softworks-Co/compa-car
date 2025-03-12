import type React from 'react';
import { useState, useEffect } from 'react';
import { Container, Title, Text, LoadingOverlay, Button } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import RolSelector from './RolSelector';
import TripFilter from './TripFilter';
import EditTripModal from './EditTripModal';
import DeleteTripModal from './DeleteTripModal';
import Cupos from '../../routes/Cupos'; // Import Cupos
import styles from './index.module.css';
import TripCard from './TripCard';
import { supabase } from '@/lib/supabaseClient';

export interface Trip {
    id: number;
    origin: { address: string };
    destination: { address: string };
    date: string;
    time: string;
    duration: string;
    distance: string;
    seats: number;
    pricePerSeat: number;
    description: string;
    allowPets: boolean;
    allowSmoking: boolean;
    is_active: boolean;
    user_id: number;
    date_time: string;
}

interface UserProfile {
    id: number;
    email: string;
    phone_number: string | null;
    first_name: string;
    last_name: string;
    identification_type: string;
    identification_number: string;
    user_type: string;
}



const Actividades: React.FC = () => {
    const navigate = useNavigate(); // Mover useNavigate al nivel superior
    const [trips, setTrips] = useState<Trip[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);
    const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
    const [filterValue, setFilterValue] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const ActivityType = {
        VIAJES: 'Viajes Publicados',
        CUPOS: 'Cupos Creados'
    } as const;
    type ActivityType = 'Viajes Publicados' | 'Cupos Creados' | null;
    const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string>('');

    useEffect(() => {
        const getToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setToken(session?.access_token || '');
        };
        getToken();
    }, []);

    const handleActivitySelect = (activity: string) => {
        console.log('Selected Activity:', activity);
        setSelectedActivity(activity as ActivityType);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error("No session found");
                }

                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (error) throw error;

                setUserProfile({
                    ...data,
                    email: session.user.email || '',
                    user_type: data.status // Asegurarnos de usar status como user_type
                });
                console.log("User Role in Actividades:", data.status);
            } catch (error: any) {
                console.error('Error fetching user profile:', error);
                showNotification({
                    title: 'Error',
                    message: error.message,
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const loadTrips = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    navigate({ to: '/Login' });
                    return;
                }

                const { data: tripsData, error } = await supabase
                    .from('trips')
                    .select(`
                        id,
                        created_at,
                        seats,
                        price_per_seat,
                        description,
                        allow_pets,
                        allow_smoking,
                        status,
                        user_id,
                        route_id,
                        routes (
                            duration,
                            distance,
                            summary
                        ),
                        origin:locations!trips_origin_id_fkey (
                            address
                        ),
                        destination:locations!trips_destination_id_fkey (
                            address
                        )
                    `)
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                console.log('Trips raw data:', tripsData);

                if (error) throw error;

                const formattedTrips = tripsData.map(trip => ({
                    id: trip.id,
                    origin: { 
                        address: trip.origin?.address || 'Dirección no disponible'
                    },
                    destination: { 
                        address: trip.destination?.address || 'Dirección no disponible'
                    },
                    date: trip.created_at ? new Date(trip.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    time: new Date(trip.created_at ?? Date.now()).toLocaleTimeString(),
                    duration: trip.routes?.duration || 'Desconocida',
                    distance: trip.routes?.distance || 'Desconocida',
                    seats: trip.seats || 0,
                    pricePerSeat: trip.price_per_seat || 0,
                    description: trip.description || '',
                    allowPets: trip.allow_pets === 'Y',
                    allowSmoking: trip.allow_smoking === 'Y',
                    is_active: trip.status === 'A',
                    user_id: Number(trip.user_id),
                    date_time: trip.created_at || new Date().toISOString()
                }));

                console.log('Formatted trips:', formattedTrips);
                setTrips(formattedTrips);
                setFilteredTrips(formattedTrips);

            } catch (error) {
                console.error('Error loading trips:', error);
                showNotification({
                    title: 'Error',
                    message: 'Error al cargar los viajes',
                    color: 'red'
                });
            } finally {
                setLoading(false);
            }
        };

        if (selectedActivity === "Viajes Publicados") {
            loadTrips();
        }
    }, [selectedActivity, navigate]); // Añadir navigate a las dependencias

    useEffect(() => {
        let filtered = [...trips];

        // Filter by address
        if (filterValue) {
            filtered = filtered.filter(
                (trip) =>
                    trip.origin.address
                        .toLowerCase()
                        .includes(filterValue.toLowerCase()) ||
                    trip.destination.address
                        .toLowerCase()
                        .includes(filterValue.toLowerCase()),
            );
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(
                (trip) =>
                    (statusFilter === 'active' && trip.is_active) ||
                    (statusFilter === 'inactive' && !trip.is_active),
            );
        }

        // Filter by date
        if (dateFilter) {
            filtered = filtered.filter((trip) =>
                dayjs(trip.date_time).isSame(dateFilter, 'day'),
            );
        }

        setFilteredTrips(filtered);
    }, [trips, filterValue, statusFilter, dateFilter]);

    const handleDelete = async (tripId: number) => {
        try {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', tripId);

            if (error) throw error;

            const updatedTrips = trips.filter(trip => trip.id !== tripId);
            setTrips(updatedTrips);
            setFilteredTrips(updatedTrips);
            setDeleteModalOpen(false);

            showNotification({
                title: 'Viaje eliminado',
                message: 'El viaje ha sido eliminado correctamente',
                color: 'green'
            });
        } catch (error) {
            console.error('Error deleting trip:', error);
            showNotification({
                title: 'Error',
                message: 'Error al eliminar el viaje',
                color: 'red'
            });
        }
    };

    const handleEdit = (index: number) => {
        setSelectedTripIndex(index);
        setEditedTrip(trips[index]);
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editedTrip) return;

        try {
            const { error } = await supabase
                .from('trips')
                .update({
                    description: editedTrip.description,
                    price_per_seat: editedTrip.pricePerSeat,
                    allow_pets: editedTrip.allowPets ? 'Y' : 'N',
                    allow_smoking: editedTrip.allowSmoking ? 'Y' : 'N'
                })
                .eq('id', editedTrip.id);

            if (error) throw error;

            const updatedTrips = trips.map(trip => 
                trip.id === editedTrip.id ? editedTrip : trip
            );
            setTrips(updatedTrips);
            setFilteredTrips(updatedTrips);
            setEditModalOpen(false);

            showNotification({
                title: 'Viaje actualizado',
                message: 'El viaje ha sido actualizado correctamente',
                color: 'green'
            });
        } catch (error) {
            console.error('Error updating trip:', error);
            showNotification({
                title: 'Error',
                message: 'Error al actualizar el viaje',
                color: 'red'
            });
        }
    };

     const handleFilterChange = (value: string | null) => {
         setFilterValue(value || '');
     };

    const handleStatusFilterChange = (value: string | null) => {
        setStatusFilter(value);
    };

    const handleDateFilterChange = (date: Date | null) => {
        setDateFilter(date);
    };
     const handleEditedTripChange = (newEditedTrip: Trip) => {
        setEditedTrip(newEditedTrip)
     }

     if (loading) {
        return (
            <Container className={styles.container}>
                <LoadingOverlay visible />
                <Title className={styles.title}>Mis Actividades</Title>
                 <Text className={styles.noTripsText}>Cargando tus actividades...</Text>
            </Container>
        );
    }

    return (
        <Container className={styles.container}>
            <div className={styles.headerContainer}>
                <Title className={styles.title}>
                    {selectedActivity === "Viajes Publicados" && userProfile?.user_type === "DRIVER"
                        ? <>Tus viajes, <span className={styles.userName}>{userProfile?.first_name || 'Cliente'}</span></>
                        : 'Mis Actividades'}
                </Title>
                <RolSelector onSelect={handleActivitySelect} />
            </div>

            {selectedActivity === 'Viajes Publicados' && userProfile?.user_type === "DRIVER" && (
                <>
                    <TripFilter
                        trips={trips}
                        filterValue={filterValue}
                        onFilterChange={handleFilterChange}
                        statusFilter={statusFilter}
                        onStatusFilterChange={handleStatusFilterChange}
                         dateFilter={dateFilter}
                        onDateFilterChange={handleDateFilterChange}
                    />
            <div className={styles.tripListContainer}>
                {filteredTrips.map((trip, index) => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        onEdit={() => handleEdit(index)}
                        onDelete={() => {
                            setSelectedTripIndex(index);
                            setDeleteModalOpen(true);
                        }}
                        token={token}
                        userId={String(userProfile?.id || 0)}
                    />
                ))}
            </div>
               </>
           )}

            {selectedActivity === 'Cupos Creados' && userProfile?.id && token && (
                        <Cupos userId={userProfile.id} token={token} />
                    )}
            {selectedActivity === 'Viajes Publicados' && userProfile?.user_type === "PASSENGER" && (
                <Text className={styles.noTripsText}>
                    Para publicar viajes, necesitas completar tu perfil de conductor.
                </Text>
            )}
            <EditTripModal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                 editedTrip={editedTrip}
                 onEditSubmit={handleEditSubmit}
                 onEditedTripChange={handleEditedTripChange}
           />

           <DeleteTripModal
               opened={deleteModalOpen}
               onClose={() => setDeleteModalOpen(false)}
               onDelete={() => selectedTripIndex !== null ? handleDelete(trips[selectedTripIndex].id) : undefined}
            />

            {trips.length === 0 && selectedActivity === "Viajes Publicados" && userProfile?.user_type === "DRIVER" &&(
                <Container className={styles.container}>
                    <Text className={styles.noTripsText}>No tienes viajes publicados.</Text>
                      <Button
                        className={styles.publishButton}
                        component="a"
                        href="/publicarviaje"
                    >
                        Publica tu primer viaje
                    </Button>
                 </Container>
            )}
           {selectedActivity && <p>Has seleccionado: {selectedActivity}</p>}
        </Container>
    );
};

export default Actividades;
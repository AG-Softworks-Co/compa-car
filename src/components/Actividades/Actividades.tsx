import React, { useState, useEffect } from 'react';
import { Container, Title, Text, LoadingOverlay, Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import RolSelector from './RolSelector';
import TripList from './TripList';
import TripFilter from './TripFilter';
import EditTripModal from './EditTripModal';
import DeleteTripModal from './DeleteTripModal';
import Cupos from '../../routes/Cupos'; // Import Cupos
import styles from './index.module.css';
import TripCard from './TripCard';

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

interface ApiTrip {
    trip_id: number;
    main_text_origen: string;
    main_text_destination: string;
    date_time: string;
    duration: string;
    distance: string;
    seats: number;
    price_per_seat: number;
    description: string;
    allow_pets: number;
    allow_smoking: number;
    status: string;
    user_id: number;
}

interface UserProfile {
    id: number;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    identification_type: string;
    identification_number: string;
    user_type: string;
}

interface ActividadesProps {
    userId: number;
    token: string;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const Actividades: React.FC<ActividadesProps> = ({ userId, token }) => {
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
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


    const handleActivitySelect = (activity: string) => {
        console.log('Selected Activity:', activity);
        setSelectedActivity(activity);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log('fetching user profile...')
                const response = await fetch(`${BASE_URL}/users/${userId}`, {
                    headers: { 'x-token': token },
                });

                const responseData = await response.json();
                console.log('Respuesta verificación perfil:', responseData);

                if (!response.ok || !responseData.ok) {
                    throw new Error(responseData.msj || "Error al obtener el perfil del usuario");
                }
                if (responseData.ok && responseData.data) {
                    setUserProfile(responseData.data);
                    console.log("User Role in Actividades:", responseData.data.user_type);
                } else {
                    throw new Error("Error al obtener el perfil del usuario: No data found");
                }


            } catch (error: any) {
                console.error('Error al obtener el perfil del usuario:', error);
                showNotification({
                    title: 'Error al obtener el perfil',
                    message: `Hubo un error al cargar el perfil del usuario. Detalle: ${error.message || 'Desconocido'}`,
                    color: 'red',
                });
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        };

        console.log('selectedActivity before fetchUserRole:', selectedActivity);
        fetchUserProfile();
    }, [userId, token]);

    useEffect(() => {
       const fetchTrips = async () => {
            console.log('Fetching trips...');
            try {
                const response = await fetch(`${BASE_URL}/trips/user_id/${userId}`, {
                    headers: {
                        'x-token': token,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching trips:', errorData);
                    showNotification({
                        title: 'Error al obtener los viajes',
                        message: `Hubo un error al cargar los viajes desde el servidor. Detalle: ${
                            errorData.msj || 'Desconocido'
                        }`,
                        color: 'red',
                    });
                    setLoading(false);
                    return;
                }
                const responseData = await response.json();
                 if (!responseData.data || !Array.isArray(responseData.data)) {
                    console.error(
                        'Invalid response from API: data array not found',
                        responseData,
                    );
                    showNotification({
                        title: 'Error al obtener los viajes',
                        message: 'La respuesta del servidor no tiene el formato esperado.',
                        color: 'red',
                    });
                    setLoading(false);
                    return;
                }

                const tripsData = responseData.data;
                console.log('Trips data:', tripsData);
                const apiTrips = tripsData
                .map((tripData: ApiTrip) => ({
                    id: tripData.trip_id,
                    origin: { address: tripData.main_text_origen },
                    destination: { address: tripData.main_text_destination },
                    date: new Date(tripData.date_time).toLocaleDateString(),
                     time: new Date(tripData.date_time).toLocaleTimeString([], {
                         hour: '2-digit',
                        minute: '2-digit',
                    }),
                     duration: tripData.duration,
                    distance: tripData.distance,
                    seats: tripData.seats,
                    pricePerSeat: tripData.price_per_seat,
                     description: tripData.description,
                     allowPets: tripData.allow_pets === 1,
                    allowSmoking: tripData.allow_smoking === 1,
                    is_active: tripData.status === 'active',
                    user_id: tripData.user_id,
                    date_time: tripData.date_time,
                }))
                .filter((trip: Trip) => {
                     const userMatch = trip.user_id === userId;
                    console.log(`Checking if user_id ${trip.user_id} matches userId ${userId}: ${userMatch}`);
                    return userMatch;
                })
                .sort((a: Trip, b: Trip) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
                .map((trip: Trip) => {
                    const isPast = dayjs(trip.date_time).isBefore(dayjs(), 'day');
                     return { ...trip, is_active: isPast ? false : trip.is_active };
                 });

                setTrips(apiTrips);
                setFilteredTrips(apiTrips);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching trips:', error);
                 showNotification({
                    title: 'Error al obtener los viajes',
                    message:
                        'Hubo un error al cargar los viajes desde el servidor. Intenta de nuevo más tarde.',
                     color: 'red',
                 });
                setLoading(false);
            }
         };
         console.log('selectedActivity before trips fetch:', selectedActivity);
         if (selectedActivity === "Viajes Publicados" && userProfile?.user_type === "DRIVER") {
            console.log('fetching trips for drivers');
            fetchTrips();
        }
    }, [userId, token, selectedActivity, userProfile?.user_type]);


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

    const handleDelete = async () => {
        if (selectedTripIndex === null) {
            console.error("No trip selected to delete");
            return;
        }

        const tripToDelete = trips[selectedTripIndex];
        console.log("Deleting trip with ID:", tripToDelete.id);

        try {
            const response = await fetch(`${BASE_URL}/trips/${tripToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'x-token': token, // Using the token from props
                },
            });
             console.log('Response status:', response.status);
            if (!response.ok) {
                 const errorData = await response.json();
                 console.error('Error deleting trip:', errorData);
                showNotification({
                    title: 'Error al eliminar el viaje',
                    message: `Hubo un error al intentar eliminar el viaje. Detalle: ${errorData.msj || "Desconocido"}`,
                    color: 'red',
                });
                return;
            }

            const updatedTrips = trips.filter((_, i) => i !== selectedTripIndex);
            setTrips(updatedTrips);
            setFilteredTrips(updatedTrips);

            setDeleteModalOpen(false);
            setSelectedTripIndex(null);

            showNotification({
                title: 'Viaje eliminado',
                message: 'El viaje ha sido eliminado exitosamente.',
                color: 'red',
            });
        } catch (error: any) {
            console.error('Error deleting trip:', error.message);
           showNotification({
                title: 'Error al eliminar el viaje',
                message:
                    'Hubo un error al intentar eliminar el viaje. Intenta de nuevo más tarde.',
                color: 'red',
            });
        }
    };

    const handleEdit = (index: number) => {
        setSelectedTripIndex(index);
        setEditedTrip(trips[index]);
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (selectedTripIndex === null || !editedTrip) return;
        try {
            const response = await fetch(`${BASE_URL}/trips/${editedTrip.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token,
                },
                body: JSON.stringify({
                    summary: editedTrip.description,
                    price_per_seat: editedTrip.pricePerSeat,
                    allow_pets: editedTrip.allowPets,
                    allow_smoking: editedTrip.allowSmoking,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating trip:', errorData);
                showNotification({
                    title: 'Error al editar el viaje',
                    message: `Hubo un error al intentar editar el viaje. Detalle: ${
                        errorData.msj || 'Desconocido'
                    }`,
                    color: 'red',
                });
                return;
            }

            const updatedTrips = [...trips];
            updatedTrips[selectedTripIndex] = editedTrip;
            setTrips(updatedTrips);
            setFilteredTrips(updatedTrips);

            setEditModalOpen(false);
            setSelectedTripIndex(null);
            setEditedTrip(null);

            showNotification({
                title: 'Viaje editado',
                message: 'El viaje ha sido actualizado exitosamente.',
                color: 'green',
            });
        } catch (error) {
             console.error('Error updating trip:', error);
            showNotification({
                title: 'Error al editar el viaje',
                message:
                    'Hubo un error al intentar editar el viaje. Intenta de nuevo más tarde.',
                color: 'red',
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
                 {userProfile && (
                     <RolSelector userId={userId} token={token} onSelect={handleActivitySelect} role={userProfile?.user_type ?? null} />
                )}
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
                                    userId={userId}
                                />
                            ))}
                        </div>
               </>
           )}

            {selectedActivity === 'Cupos Creados' && (
                <Cupos userId={userId} token={token} />
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
               onDelete={handleDelete}
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
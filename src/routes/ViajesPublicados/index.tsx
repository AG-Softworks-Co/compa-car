import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Title,
  Button,
  Modal,
  NumberInput,
  Textarea,
  Switch,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { Navigation, Clock, Users, DollarSign, Edit, Trash } from "lucide-react";
import { showNotification } from "@mantine/notifications";
import styles from "./index.module.css";
import dayjs from "dayjs";
import { DateTimePicker } from '@mantine/dates';

interface Trip {
  id: number;
  origin: {
    address: string;
  };
  destination: {
    address: string;
  };
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

const getFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const BASE_URL = "https://rest-sorella-production.up.railway.app/api";

function MyTripsView() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
    const [filterValue, setFilterValue] = useState<string>("");
     const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userIdString = localStorage.getItem("userId");
        const userId = userIdString ? parseInt(userIdString, 10) : null;

        if (!userId) {
            setLoading(false);
             showNotification({
                title: "Usuario no encontrado",
                message: "No se encontró el ID del usuario. Inicie sesión nuevamente.",
               color: "red",
            });
            return;
       }

        const fetchTrips = async () => {
            try {
              const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found");
                     showNotification({
                       title: "No se encontró el token",
                       message:
                         "No se encontró el token de usuario. Inicia sesión nuevamente.",
                       color: "red",
                   });
                    return;
                }
             console.log("user id send to endpoint", userId);
             const response = await fetch(`${BASE_URL}/trips/user_id/${userId}`, {
                headers: {
                  "x-token": token,
                },
              });

                if (!response.ok) {
                    const errorData = await response.json();
                   console.error("Error fetching trips:", errorData);
                    showNotification({
                      title: "Error al obtener los viajes",
                        message: `Hubo un error al cargar los viajes desde el servidor. Detalle: ${
                           errorData.msj || "Desconocido"
                        }`,
                      color: "red",
                   });
                    setLoading(false);
                    return;
                }
               const responseData = await response.json();
                if (!responseData.data || !Array.isArray(responseData.data)) {
                   console.error('Invalid response from API: data array not found', responseData);
                    showNotification({
                      title: "Error al obtener los viajes",
                         message: "La respuesta del servidor no tiene el formato esperado.",
                        color: "red",
                    });
                   setLoading(false);
                    return;
              }

               const tripsData = responseData.data;
                 console.log("Data from API:", tripsData);


                 const apiTrips = tripsData
                 .map((tripData: ApiTrip) => ({
                   id: tripData.trip_id,
                   origin: { address: tripData.main_text_origen },
                   destination: { address: tripData.main_text_destination },
                   date: new Date(tripData.date_time).toLocaleDateString(),
                   time: new Date(tripData.date_time).toLocaleTimeString([], {
                     hour: "2-digit",
                     minute: "2-digit",
                   }),
                   duration: tripData.duration,
                   distance: tripData.distance,
                   seats: tripData.seats,
                   pricePerSeat: tripData.price_per_seat,
                   description: tripData.description,
                   allowPets: tripData.allow_pets === 1,
                   allowSmoking: tripData.allow_smoking === 1,
                   is_active: tripData.status === "active",
                   user_id: tripData.user_id,
                   date_time: tripData.date_time,
                 }))
                 .filter((trip: Trip) => trip.user_id === userId)
                 .map((trip: Trip) => {
                   const isPast = dayjs(trip.date_time).isBefore(dayjs(), 'day');
                   return { ...trip, is_active: isPast ? false : trip.is_active };
                 });


                setTrips(apiTrips);
                setFilteredTrips(apiTrips);
                setLoading(false);
            } catch (error: any) {
                 console.error("Error fetching trips:", error.message);
                showNotification({
                  title: "Error al obtener los viajes",
                  message:
                    "Hubo un error al cargar los viajes desde el servidor. Intenta de nuevo más tarde.",
                  color: "red",
              });
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);


    useEffect(() => {
        let filtered = [...trips];

        // Filter by address
        if (filterValue) {
           filtered = filtered.filter(
             (trip: Trip) =>
               trip.origin.address.toLowerCase().includes(filterValue.toLowerCase()) ||
               trip.destination.address.toLowerCase().includes(filterValue.toLowerCase())
           );
        }

       // Filter by status
        if (statusFilter) {
           filtered = filtered.filter(
             (trip: Trip) =>
               (statusFilter === "active" && trip.is_active) ||
              (statusFilter === "inactive" && !trip.is_active)
          );
        }

      // Filter by date
        if (dateFilter) {
           filtered = filtered.filter((trip: Trip) => dayjs(trip.date_time).isSame(dateFilter, 'day'));
      }


        setFilteredTrips(filtered);
    }, [trips, filterValue, statusFilter, dateFilter]);


  const handleDelete = async () => {
    if (selectedTripIndex === null) return;

    const tripToDelete = trips[selectedTripIndex];
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      showNotification({
        title: "No se encontró el token",
        message:
          "No se encontró el token de usuario. Inicia sesión nuevamente.",
        color: "red",
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/trips/${tripToDelete.id}`, {
        method: "DELETE",
        headers: {
          "x-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting trip:", errorData);
        showNotification({
          title: "Error al eliminar el viaje",
          message: `Hubo un error al intentar eliminar el viaje. Detalle: ${
            errorData.msj || "Desconocido"
          }`,
          color: "red",
        });
        return;
      }

      const updatedTrips = trips.filter((_, i) => i !== selectedTripIndex);
      setTrips(updatedTrips);
      setFilteredTrips(updatedTrips);

      setDeleteModalOpen(false);
      setSelectedTripIndex(null);

      showNotification({
        title: "Viaje eliminado",
        message: "El viaje ha sido eliminado exitosamente.",
        color: "red",
      });
    } catch (error: any) {
      console.error("Error deleting trip:", error.message);
      showNotification({
        title: "Error al eliminar el viaje",
        message:
          "Hubo un error al intentar eliminar el viaje. Intenta de nuevo más tarde.",
        color: "red",
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
      const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          showNotification({
            title: "No se encontró el token",
            message:
              "No se encontró el token de usuario. Inicia sesión nuevamente.",
            color: "red",
          });
         return;
        }
    try {
      const response = await fetch(`${BASE_URL}/trips/${editedTrip.id}`, {
          method: "PUT",
        headers: {
           "Content-Type": "application/json",
            "x-token": token,
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
          console.error("Error updating trip:", errorData);
           showNotification({
             title: "Error al editar el viaje",
             message: `Hubo un error al intentar editar el viaje. Detalle: ${
                errorData.msj || "Desconocido"
            }`,
             color: "red",
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
        title: "Viaje editado",
        message: "El viaje ha sido actualizado exitosamente.",
        color: "green",
      });
    } catch (error: any) {
       console.error("Error updating trip:", error.message);
      showNotification({
        title: "Error al editar el viaje",
         message:
          "Hubo un error al intentar editar el viaje. Intenta de nuevo más tarde.",
          color: "red",
      });
    }
  };

   const handleFilter = (value: string | null) => {
       setFilterValue(value || "");
  };
    const handleStatusFilterChange = (value: string | null) => {
        setStatusFilter(value);
    };

    const handleDateFilterChange = (date: Date | null) => {
        setDateFilter(date);
    };

     if (loading) {
        return (
            <Container className={styles.container}>
                <LoadingOverlay visible  />
                 <Title className={styles.title}>Mis Viajes</Title>
               <Text className={styles.noTripsText}>Cargando tus viajes...</Text>
            </Container>
        );
    }

    if (trips.length === 0) {
        return (
            <Container className={styles.container}>
                <Title className={styles.title}>Mis Viajes</Title>
                <Text className={styles.noTripsText}>No tienes viajes publicados.</Text>
                <Button
                    className={styles.publishButton}
                    component="a"
                    href="/publicarviaje"
                >
                   Publica tu primer viaje
                </Button>
            </Container>
        );
    }

    return (
        <Container className={styles.container}>
            <Title className={styles.title}>Mis Viajes</Title>
              <div className={styles.filterContainer}>
                <Text className={styles.filterLabel}>Filtrar por:</Text>
                  <Select
                    placeholder="Origen o destino"
                    value={filterValue}
                    onChange={handleFilter}
                  data={Array.from(
                        new Set(
                           trips.flatMap((trip: Trip) => [
                               trip.origin.address,
                                trip.destination.address,
                         ])
                      )
                  )}
                  clearable
                  searchable
                    className={styles.filterSelect}
                />
                 <Select
                        placeholder="Estado"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        data={[
                          { value: 'active', label: 'Activo' },
                          { value: 'inactive', label: 'Inactivo' },
                        ]}
                       clearable
                        className={styles.filterSelect}
                    />
                 <DateTimePicker
                        placeholder="Fecha de viaje"
                        value={dateFilter}
                        onChange={handleDateFilterChange}
                       clearable
                        locale="es"
                        className={styles.filterSelect}
                   />

              {filteredTrips.length === 0 && (
                <Text className={styles.noTripsText}>
                    No se encontraron viajes con el filtro seleccionado.
                </Text>
              )}
             </div>


      <Stack gap="lg">
        {filteredTrips.map((trip, index) => (
          <Card key={trip.id} className={styles.tripCard}>
            <Group gap="apart" align="flex-start">
              <div>
                <Text className={styles.tripTitle}>
                  #{index + 1} - Origen
                </Text>
                <Text className={styles.tripText}>{trip.origin.address}</Text>
                <Text className={styles.tripTitle}>Destino</Text>
                <Text className={styles.tripText}>{trip.destination.address}</Text>
              </div>
                 <Badge
                    color={trip.is_active ? "green" : "red"}
                    className={styles.tripBadge}
                    >
                    {trip.is_active ? "Activo" : "Inactivo"}
                 </Badge>
            </Group>
            <Badge color="green" className={styles.tripBadge}>
              {trip.date} {trip.time}
            </Badge>
            <Group gap="xs" className={styles.tripInfoGroup}>
              <Badge leftSection={<Clock size={14} />}>
                {trip.duration}
              </Badge>
              <Badge leftSection={<Navigation size={14} />}>
                {trip.distance}
              </Badge>
              <Badge leftSection={<Users size={14} />}>
                {trip.seats} Asientos
              </Badge>
              <Badge leftSection={<DollarSign size={14} />}>
                {trip.pricePerSeat} COP/Asiento
              </Badge>
            </Group>
            <Text size="sm" c="dimmed" className={styles.tripSummary}>
              {trip.description || "Sin descripción"}
            </Text>
            <Group gap="sm" className={styles.tripActions}>
              <Button
                size="xs"
                variant="outline"
                color="blue"
                leftSection={<Edit size={16} />}
                onClick={() => handleEdit(index)}
              >
                Editar
              </Button>
              <Button
                size="xs"
                variant="outline"
                color="red"
                leftSection={<Trash size={16} />}
                onClick={() => {
                  setSelectedTripIndex(index);
                  setDeleteModalOpen(true);
                }}
              >
                Eliminar
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        centered
      >
        <Text>
          ¿Estás seguro de que deseas eliminar este viaje? Esta acción no se
          puede deshacer.
        </Text>
        <Group gap="md" mt="lg">
          <Button color="red" onClick={handleDelete}>
            Sí, eliminar
          </Button>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
        </Group>
      </Modal>

      {editModalOpen && editedTrip && (
        <Modal
          opened={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Viaje"
          centered
        >
          <Stack gap="md">
            <Textarea
              label="Descripción"
              value={editedTrip.description}
              onChange={(e) =>
                setEditedTrip({ ...editedTrip, description: e.target.value })
              }
            />
            <NumberInput
              label="Precio por Asiento (COP)"
              value={editedTrip.pricePerSeat}
              onChange={(value) =>
                setEditedTrip({ ...editedTrip, pricePerSeat: Number(value) })
              }
              min={0}
            />
            <Switch
              label="Permitir Mascotas"
              checked={editedTrip.allowPets}
              onChange={(e) =>
                setEditedTrip({
                  ...editedTrip,
                  allowPets: e.currentTarget.checked,
                })
              }
            />
            <Switch
              label="Permitir Fumar"
              checked={editedTrip.allowSmoking}
              onChange={(e) =>
                setEditedTrip({
                  ...editedTrip,
                  allowSmoking: e.currentTarget.checked,
                })
              }
            />
            <Button color="green" onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
          </Stack>
        </Modal>
      )}
    </Container>
    );
}

export const Route = createFileRoute("/ViajesPublicados/")({
  component: MyTripsView,
});

export default MyTripsView;
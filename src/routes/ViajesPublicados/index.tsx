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
} from "@mantine/core";
import { Navigation, Clock, Users, DollarSign, Edit, Trash } from "lucide-react";
import { showNotification } from "@mantine/notifications";
import styles from "./index.module.css";

interface Trip {
  origin: {
    address: string;
  };
  destination: {
    address: string;
  };
  date: string;
  time: string;
  selectedRoute: {
    duration: string;
    distance: string;
  };
  seats: number;
  pricePerSeat: number;
  description: string;
  allowPets: boolean;
  allowSmoking: boolean;
}

const getFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function MyTripsView() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
  const [filterValue, setFilterValue] = useState<string>("");

  useEffect(() => {
    const storedTrips = getFromLocalStorage("publishedTrips") || [];
    setTrips(storedTrips);
    setFilteredTrips(storedTrips);
  }, []);

  const handleDelete = () => {
    if (selectedTripIndex === null) return;

    const updatedTrips = trips.filter((_, i) => i !== selectedTripIndex);
    setTrips(updatedTrips);
    setFilteredTrips(updatedTrips);
    saveToLocalStorage("publishedTrips", updatedTrips);

    setDeleteModalOpen(false);
    setSelectedTripIndex(null);

    showNotification({
      title: "Viaje eliminado",
      message: "El viaje ha sido eliminado exitosamente.",
      color: "red",
    });
  };

  const handleEdit = (index: number) => {
    setSelectedTripIndex(index);
    setEditedTrip(trips[index]);
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedTripIndex === null || !editedTrip) return;

    const updatedTrips = [...trips];
    updatedTrips[selectedTripIndex] = editedTrip;

    setTrips(updatedTrips);
    setFilteredTrips(updatedTrips);
    saveToLocalStorage("publishedTrips", updatedTrips);

    setEditModalOpen(false);
    setSelectedTripIndex(null);
    setEditedTrip(null);

    showNotification({
      title: "Viaje editado",
      message: "El viaje ha sido actualizado exitosamente.",
      color: "green",
    });
  };

  const handleFilter = (value: string | null) => {
    setFilterValue(value || ""); 
    if (!value) {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter(
        (trip) =>
          trip.origin.address.toLowerCase().includes(value.toLowerCase()) ||
          trip.destination.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTrips(filtered);
    }
  };

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
  onChange={(value) => handleFilter(value)}
  data={Array.from(
    new Set(
      trips.flatMap((trip) => [trip.origin.address, trip.destination.address])
    )
  )}
  clearable
  searchable
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
          <Card key={index} className={styles.tripCard}>
            <Group gap="apart" align="flex-start">
              <div>
                <Text className={styles.tripTitle}>
                  #{index + 1} - Origen
                </Text>
                <Text className={styles.tripText}>{trip.origin.address}</Text>
                <Text className={styles.tripTitle}>Destino</Text>
                <Text className={styles.tripText}>{trip.destination.address}</Text>
              </div>
              <Badge color="green" className={styles.tripBadge}>
                {trip.date} {trip.time}
              </Badge>
            </Group>
            <Group gap="xs" className={styles.tripInfoGroup}>
              <Badge leftSection={<Clock size={14} />}>
                {trip.selectedRoute.duration}
              </Badge>
              <Badge leftSection={<Navigation size={14} />}>
                {trip.selectedRoute.distance}
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
        <Text>¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer.</Text>
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

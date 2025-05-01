import React, { useState, useEffect } from 'react'
import {
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Modal,
} from '@mantine/core'
import {
  Navigation,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash,
  Bell,
  Flag,
} from 'lucide-react'
import { showNotification } from '@mantine/notifications'
import styles from './SrylesComponents/TripCard.module.css'
import type { Trip } from './Actividades'
import CuposReservados from '../../routes/CuposReservados'
import { supabase } from '@/lib/supabaseClient'

interface TripCardProps {
  trip: Trip
  onEdit: () => void
  onDelete: () => void
  userId: string
}

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete, userId }) => {
  const [cuposModalOpen, setCuposModalOpen] = useState(false)
  const [passengerCount, setPassengerCount] = useState(0)
  const [tripStatus, setTripStatus] = useState(trip.status)

  useEffect(() => {
    const fetchPassengerCount = async () => {
      const { data: bookings,  } = await supabase
        .from('bookings')
        .select('id')
        .eq('trip_id', trip.id)

      const bookingIds = bookings?.map((b) => b.id) || []

      if (bookingIds.length === 0) return setPassengerCount(0)

      const { count } = await supabase
        .from('booking_passengers')
        .select('*', { count: 'exact', head: true })
        .in('booking_id', bookingIds)

      setPassengerCount(count || 0)
    }

    fetchPassengerCount()
  }, [trip.id])

  const handleCuposClick = () => setCuposModalOpen(true)
  const handleCloseCuposModal = () => setCuposModalOpen(false)

  const handleStartTrip = async () => {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('booking_status', 'payed')

      if (!bookings?.length) {
        return showNotification({
          title: 'No hay cupos pagados',
          message: 'Debes tener al menos un pasajero con pago completado.',
          color: 'red',
        })
      }

      await supabase.from('trips').update({ status: 'progress' }).eq('id', trip.id)
      setTripStatus('progress')
      showNotification({
        title: '¡Viaje Iniciado!',
        message: 'El viaje ha comenzado exitosamente. ¡Buen camino!',
        color: 'green',
      })
    } catch {
      showNotification({
        title: 'Error',
        message: 'No se pudo iniciar el viaje.',
        color: 'red',
      })
    }
  }

  const handleFinishTrip = async () => {
    try {
      await supabase.from('trips').update({ status: 'finished' }).eq('id', trip.id)
      setTripStatus('finished')
      showNotification({
        title: 'Viaje Finalizado',
        message: 'El viaje fue marcado como finalizado con éxito.',
        color: 'green',
      })
    } catch {
      showNotification({
        title: 'Error',
        message: 'No se pudo finalizar el viaje.',
        color: 'red',
      })
    }
  }

  return (
    <div key={trip.id} className={styles.tripCard}>
      <div className={styles.tripHeader}>
        <Badge
          color={
            tripStatus === 'finished'
              ? 'green'
              : tripStatus === 'progress'
              ? 'yellow'
              : 'gray'
          }
          className={styles.tripBadge}
        >
          {tripStatus === 'finished'
            ? 'Finalizado'
            : tripStatus === 'progress'
            ? 'En progreso'
            : 'Pendiente'}
        </Badge>

        <div className={styles.tripActionsIcons}>
          <ActionIcon variant="outline" color="blue" onClick={onEdit}>
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon variant="outline" color="red" onClick={onDelete}>
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

      <Badge color="blue" className={styles.tripBadge}>
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
          leftSection={<Bell size={16} />}
          rightSection={
            passengerCount > 0 && (
              <Badge color="blue" size="xs">
                {passengerCount}
              </Badge>
            )
          }
        >
          Cupos Comprados
        </Button>

        {tripStatus === 'progress' ? (
         <Button
         size="xs"
         variant="filled"
         color="red"
         onClick={handleFinishTrip}
         leftSection={<Flag size={14} />}
         styles={{
           root: {
             fontWeight: 600,
           },
         }}
         >
         Finalizar Viaje
         </Button>
        ) : tripStatus === 'finished' ? (
          <Badge color="green">Viaje Finalizado</Badge>
        ) : (
          <Button
            size="xs"
            variant="outline"
            color="green"
            onClick={handleStartTrip}
          >
            Iniciar Viaje
          </Button>
        )}
      </Group>

      <Modal opened={cuposModalOpen} onClose={handleCloseCuposModal}>
        <CuposReservados tripId={trip.id} userId={userId} />
      </Modal>
    </div>
  )
}

export default TripCard

import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Stack,
  Text,
  Title,
  Button,
  Divider,
  LoadingOverlay,
} from '@mantine/core';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ArrowLeft, AlertCircle, Navigation } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';
import styles from './ViewTicket.module.css';
import { useNavigate, useSearch, createFileRoute } from '@tanstack/react-router';

interface PassengerData {
  id: number;
  full_name: string;
  identification_number: string;
}

interface TripLocation {
  origin: { address: string };
  destination: { address: string };
}

const ViewTicket = () => {
  const navigate = useNavigate();
  const { booking_id } = useSearch({ from: Route.id });

  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [tripLocations, setTripLocations] = useState<TripLocation | null>(null);
  const [bookingQr, setBookingQr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!booking_id) {
        console.error('booking_id inválido');
        navigate({ to: '/Actividades' });
        return;
      }

      try {
        // 1. Obtener booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('trip_id, booking_qr')
          .eq('id', Number(booking_id))
          .single();

        if (bookingError || !bookingData) {
          throw new Error('No se pudo obtener el booking');
        }

        const tripId = bookingData.trip_id;
        setBookingQr(bookingData.booking_qr || '');

        // 2. Obtener pasajeros asociados a ese booking
        const { data: passengersData, error: passengersError } = await supabase
          .from('booking_passengers')
          .select('id, full_name, identification_number')
          .eq('booking_id', Number(booking_id));

        if (passengersError || !passengersData?.length) {
          throw new Error('No se encontraron pasajeros');
        }

        setPassengers(passengersData);

        // 3. Obtener viaje
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('origin_id, destination_id')
          .eq('id', Number(tripId))
          .single();

        if (tripError || !tripData) {
          throw new Error('No se pudo obtener el viaje');
        }

        // 4. Obtener direcciones
        const { data: originLocation } = await supabase
          .from('locations')
          .select('address')
          .eq('id', Number(tripData.origin_id ?? -1))
          .single();

        const { data: destinationLocation } = await supabase
          .from('locations')
          .select('address')
          .eq('id', Number(tripData.destination_id ?? -1))
          .single();

        setTripLocations({
          origin: originLocation || { address: 'Origen no disponible' },
          destination: destinationLocation || { address: 'Destino no disponible' },
        });
      } catch (error) {
        console.error('Error cargando datos del tiquete:', error);
        navigate({ to: '/Actividades' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, booking_id]);

  const handleDownload = async () => {
    const ticketElement = document.getElementById(`ticket-${booking_id}`);
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${booking_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generando el ticket:', error);
    }
  };

  if (loading) {
    return (
      <Container className={styles.ticketContainer}>
        <LoadingOverlay visible />
        <Title className={styles.ticketTitle}>Cargando tiquete...</Title>
      </Container>
    );
  }

  if (!passengers.length || !tripLocations) {
    return (
      <Container className={styles.ticketContainer}>
        <Card className={styles.ticketCard}>
          <Stack align="center" gap="md">
            <AlertCircle size={48} color="#ff6b6b" />
            <Text ta="center" size="lg" c="white">
              No se encontró información del tiquete
            </Text>
            <Button onClick={() => navigate({ to: '/Actividades' })} variant="light">
              Volver a actividades
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={styles.ticketContainer} size="xs">
      <button className={styles.backButton} onClick={() => navigate({ to: '/Actividades' })}>
        <ArrowLeft size={16} />
        Volver
      </button>

      <Card
        id={`ticket-${booking_id}`}
        shadow="xl"
        radius="xl"
        padding="xl"
        className={styles.ticketCard}
      >
        <div className={styles.logoWrapper}>
          <img src="https://mqwvbnktcokcccidfgcu.supabase.co/storage/v1/object/public/Resources/Home/Logo.png" alt="Cupo" className={styles.logo} /> 
          <span className={styles.brandName}>Cupo</span>
        </div>

        <Stack align="center" gap="md" mt={40}>
          <Title order={2} className={styles.ticketTitle}>Tiquete Digital</Title>
          <Text size="xs" c="dimmed">Emitido: {dayjs().format('DD/MM/YYYY HH:mm')}</Text>

          <Divider my="sm" color="gray" />

          <div className={styles.routeInfo}>
            <div className={styles.location}>
              <Text size="sm" color="dimmed">Origen</Text>
              <Text className={styles.direccion}>{tripLocations.origin.address}</Text>
            </div>
            <div className={styles.carIcon}>
              <Navigation size={20} strokeWidth={2} />
            </div>
            <div className={styles.location}>
              <Text size="sm" color="dimmed">Destino</Text>
              <Text className={styles.direccion}>{tripLocations.destination.address}</Text>
            </div>
          </div>

          <Divider my="sm" color="gray" />

          <Stack gap="xs" align="center">
            <Text size="sm" color="dimmed">Pasajeros</Text>
            {passengers.map((p) => (
              <div key={p.id} style={{ textAlign: 'center' }}>
                <Text size="lg" fw={600}>{p.full_name}</Text>
                <Text size="sm" color="dimmed">Identificación: {p.identification_number}</Text>
              </div>
            ))}
          </Stack>

          <Divider my="sm" color="gray" />

          <Text size="sm" c="#34D399" fw={500}>Código QR del viaje</Text>
          <QRCodeCanvas
            value={bookingQr}
            size={200}
            level="H"
            includeMargin={true}
            style={{
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '16px',
              boxShadow: '0 0 12px rgba(0,0,0,0.25)',
            }}
          />

          <Divider my="sm" color="gray" />

          <Text size="xs" color="dimmed" ta="center">
            Este tiquete es válido únicamente para los pasajeros registrados. <br />
            Preséntalo al conductor al abordar.
          </Text>

          <Button
            onClick={handleDownload}
            leftSection={<Download size={16} />}
            radius="xl"
            fullWidth
            mt="sm"
            color="teal"
            variant="gradient"
            gradient={{ from: 'teal', to: 'green', deg: 90 }}
          >
            Descargar Tiquete
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export const Route = createFileRoute('/Cupos/ViewTicket')({
  component: ViewTicket,
  validateSearch: (search) => ({
    booking_id: String(search.booking_id ?? ''),
  }),
});

export default ViewTicket;

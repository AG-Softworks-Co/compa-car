import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Button,
  TextInput,
  Paper,
  Grid,
  Alert,
} from '@mantine/core';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, AlertCircle, MapPin, Clock } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import styles from './index.module.css';

interface PassengerData {
  fullName: string;
  identification: string;
  seatNumber: number;
}

interface TripData {
  id: string;
  origin: { address: string };
  destination: { address: string };
  dateTime: string;
  pricePerSeat: number;
  selectedRoute: {
    duration: string;
    distance: string;
  };
}

interface ReservationData {
  tripId: string;
  passengersCount: number;
  totalPrice: number;
  status: 'confirmed';
}

const TicketTemplate = ({ passenger, trip }: { passenger: PassengerData; trip: TripData }) => {
  return (
    <div className={styles.ticketTemplate}>
      <div className={styles.ticketHeader}>
        <div className={styles.ticketLogo}>
          <img src="./public/Logo.png" alt="CompaCar" className={styles.logo} />
        </div>
        <Title order={3} className={styles.ticketTitle}>Cupo </Title>
        <Text className={styles.ticketSubtitle}>Tiquete de Viaje</Text>
      </div>
      
      <div className={styles.ticketContent}>
        <div className={styles.passengerInfo}>
          <Title order={4} className={styles.passengerName}>
            {passenger.fullName}
          </Title>
          <Text className={styles.idNumber}>CC: {passenger.identification}</Text>
          <Text className={styles.seatNumber}>Asiento #{passenger.seatNumber}</Text>
        </div>

        <div className={styles.qrSection}>
          <QRCodeCanvas
            id={`qr-${passenger.seatNumber}`}
            value={JSON.stringify({
              t: {
                i: trip.id,
                f: trip.origin.address,
                t: trip.destination.address,
                d: dayjs(trip.dateTime).format('YYYY-MM-DD HH:mm')
              },
              p: {
                n: passenger.fullName,
                i: passenger.identification,
                s: passenger.seatNumber
              },
              s: 'PAID'
            })}
            size={150}
            level="L"
            includeMargin={true}
          />
        </div>

        <div className={styles.tripDetails}>
          <Stack gap="md">
            <Group gap="xs">
              <MapPin size={16} className={styles.icon} />
              <div>
                <Text size="sm" fw={500}>Origen:</Text>
                <Text size="sm">{trip.origin.address}</Text>
              </div>
            </Group>
            <Group gap="xs">
              <MapPin size={16} className={styles.icon} />
              <div>
                <Text size="sm" fw={500}>Destino:</Text>
                <Text size="sm">{trip.destination.address}</Text>
              </div>
            </Group>
            <Group gap="xs">
              <Clock size={16} className={styles.icon} />
              <div>
                <Text size="sm" fw={500}>Fecha y Hora:</Text>
                <Text size="sm">{dayjs(trip.dateTime).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
            </Group>
            <Group gap="xs">
              <Clock size={16} className={styles.icon} />
              <div>
                <Text size="sm" fw={500}>Duración Estimada:</Text>
                <Text size="sm">{trip.selectedRoute.duration}</Text>
              </div>
            </Group>
          </Stack>
        </div>
      </div>

      <div className={styles.ticketFooter}>
        <Text size="xs" c="dimmed">ID: {trip.id}</Text>
        <Text size="xs" c="dimmed">Este tiquete es válido solo para la fecha y hora indicadas</Text>
      </div>
    </div>
  );
};

const ConfirmarCupoView = () => {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [currentStep, setCurrentStep] = useState<'form' | 'qr'>('form');
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const loadedReservation = getFromLocalStorage<ReservationData>('currentReservation');
    const loadedTrip = getFromLocalStorage<TripData>('currentTrip');

    if (!loadedReservation || !loadedTrip) {
      navigate({ to: '/reservar' });
      return;
    }

    setReservation(loadedReservation);
    setTrip(loadedTrip);
    // Initialize passenger array based on count
    setPassengers(Array(loadedReservation.passengersCount).fill(null).map((_, index) => ({
      fullName: '',
      identification: '',
      seatNumber: index + 1
    })));
  }, [navigate]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    passengers.forEach((passenger, index) => {
      if (!passenger.fullName.trim()) {
        newErrors[`name-${index}`] = 'El nombre es requerido';
      } else if (passenger.fullName.length < 5) {
        newErrors[`name-${index}`] = 'Nombre demasiado corto';
      }
      
      if (!passenger.identification.trim()) {
        newErrors[`id-${index}`] = 'La identificación es requerida';
      } else if (!/^\d{8,12}$/.test(passenger.identification)) {
        newErrors[`id-${index}`] = 'Identificación inválida (8-12 dígitos)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePassengerDataChange = (index: number, field: keyof PassengerData, value: string) => {
    setPassengers(prev => 
      prev.map((passenger, i) => 
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );

    if (errors[`${field}-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${field}-${index}`];
      setErrors(newErrors);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      saveToLocalStorage('passengers', passengers);
      setCurrentStep('qr');
    }
  };

  const handleDownload = async (passenger: PassengerData) => {
    if (!trip) return;

    const ticketElement = document.getElementById(`ticket-${passenger.seatNumber}`);
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${passenger.fullName}-${passenger.seatNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generando el ticket:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !trip) return;

    const ticketsHtml = passengers.map(passenger => (
      `<div style="page-break-after: always; margin: 20px;">
         <div id="ticket-${passenger.seatNumber}">
           ${document.getElementById(`ticket-${passenger.seatNumber}`)?.outerHTML}
         </div>
       </div>`
    )).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Tiquetes de Viaje - CompaCar</title>
          <style>
            ${document.getElementById('ticket-styles')?.textContent}
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
              .ticket-template {
                margin: 0 auto;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${ticketsHtml}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 250);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (!trip || !reservation) {
    return (
      <Container className={styles.container}>
        <Alert 
          icon={<AlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          No se encontró información del viaje
        </Alert>
      </Container>
    );
  }

  if (currentStep === 'form') {
    return (
      <Container size="md" className={styles.container}>
        <Card className={styles.formCard}>
          <Title order={2} className={styles.title}>Información de Pasajeros</Title>
          <Text className={styles.subtitle}>
            Por favor ingrese los datos de {passengers.length} pasajero(s)
          </Text>

          {passengers.map((passenger, index) => (
            <Paper key={index} className={styles.passengerForm}>
              <Title order={4} className={styles.passengerTitle}>Pasajero {index + 1}</Title>
              <Stack gap="md">
                <TextInput
                  label="Nombre Completo"
                  required
                  value={passenger.fullName}
                  onChange={(e) => handlePassengerDataChange(index, 'fullName', e.target.value)}
                  error={errors[`name-${index}`]}
                  classNames={{
                    input: styles.input,
                    label: styles.inputLabel
                  }}
                />
                <TextInput
                  label="Número de Identificación"
                  required
                  value={passenger.identification}
                  onChange={(e) => handlePassengerDataChange(index, 'identification', e.target.value)}
                  error={errors[`id-${index}`]}
                  classNames={{
                    input: styles.input,
                    label: styles.inputLabel
                  }}
                />
              </Stack>
            </Paper>
          ))}

          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            className={styles.submitButton}
          >
            Generar Tiquetes
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className={styles.container}>
      <Card className={styles.ticketsCard}>
        <Group gap="apart" mb="xl">
          <Title order={2} className={styles.title}>Tiquetes de Viaje</Title>
          <Button 
            variant="light"
            leftSection={<Printer size={18} />}
            onClick={handlePrint}
            className={styles.printButton}
          >
            Imprimir Todos
          </Button>
        </Group>

        <Grid gutter="xl">
          {passengers.map((passenger) => (
            <Grid.Col key={passenger.seatNumber} span={12} >
              <Card className={styles.ticketCard}>
                <div id={`ticket-${passenger.seatNumber}`} className={styles.ticketWrapper}>
                  <TicketTemplate passenger={passenger} trip={trip} />
                </div>
                <Button
                  variant="light"
                  leftSection={<Download size={16} />}
                  onClick={() => handleDownload(passenger)}
                  className={styles.downloadButton}
                  fullWidth
                >
                  Descargar Tiquete
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Button
          variant="outline"
          fullWidth
          mt="xl"
          onClick={() => navigate({ to: '/Actividades' })}
          className={styles.viewTripsButton}
        >
          Ver Mis Viajes
        </Button>
      </Card>
    </Container>
  );
};

export const Route = createFileRoute('/ConfirmarCupo/')({
  component: ConfirmarCupoView
});
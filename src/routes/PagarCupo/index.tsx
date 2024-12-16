import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Container,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Button,
  TextInput,
  Select,
  Stepper,
  Modal,

} from '@mantine/core';
import { CreditCard, Landmark, Check, AlertCircle } from 'lucide-react';
import { saveToLocalStorage, getFromLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
import dayjs from 'dayjs';
import styles from './index.module.css';

interface PaymentData {
  reservationId: string;
  amount: number;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  status: 'completed' | 'failed';
  timestamp: string;
}

interface ReservationData {
  tripId: string;
  passengersCount: number;
  totalPrice: number;
  comment: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface Trip {
  id: string;
  origin: { address: string };
  destination: { address: string };
  dateTime: string;
  seats: number;
  pricePerSeat: number;
  selectedRoute: {
    duration: string;
    distance: string;
  };
}

export function PaymentProcess() {
  const navigate = useNavigate();
  const [currentReservation, setCurrentReservation] = useState<ReservationData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [active, setActive] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadReservationData = () => {
      const tempReservation = getFromLocalStorage<ReservationData>('currentReservation');
      const tripData = getFromLocalStorage<Trip>('currentTrip');
      
      if (!tempReservation || !tripData) {
        navigate({ to: '/reservar' });
        return;
      }
      
      setCurrentReservation(tempReservation);
      setTrip(tripData);
    };

    loadReservationData();
  }, [navigate]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateCard = () => {
    const newErrors = {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    };

    const cardNumber = cardData.number.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.number = 'Número de tarjeta debe tener 16 dígitos';
    }

    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Formato inválido (MM/YY)';
    } else {
      const [month, year] = cardData.expiry.split('/');
      const currentDate = new Date();
      const cardDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (cardDate < currentDate) {
        newErrors.expiry = 'Tarjeta vencida';
      }
    }

    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = 'CVV inválido';
    }

    if (cardData.name.length < 5) {
      newErrors.name = 'Nombre del titular requerido';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardData({ ...cardData, expiry: formatted });
  };

  const handlePayment = () => {
    if (!currentReservation || !validateCard()) return;

    const payment: PaymentData = {
      reservationId: currentReservation.tripId,
      amount: currentReservation.totalPrice,
      paymentMethod,
      cardNumber: cardData.number,
      expiryDate: cardData.expiry,
      cvv: cardData.cvv,
      holderName: cardData.name,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    // Save payment data
    const payments = getFromLocalStorage<PaymentData[]>('payments') || [];
    saveToLocalStorage('payments', [...payments, payment]);

    // Update reservations
    const reservations = getFromLocalStorage<ReservationData[]>('tripReservations') || [];
    const updatedReservations = reservations.map((res: ReservationData) => 
      res.tripId === currentReservation.tripId ? { ...res, status: 'confirmed' } : res
    );
    saveToLocalStorage('tripReservations', updatedReservations);

    // Update current reservation
    const updatedCurrentReservation = { ...currentReservation, status: 'confirmed' };
    saveToLocalStorage('currentReservation', updatedCurrentReservation);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate({ to: '/ConfirmarCupo' });
    }, 2000);
  };

  const nextStep = () => setActive((current) => current + 1);

  if (!currentReservation || !trip) {
    return (
      <Container className={styles.paymentContainer}>
        <Card className={styles.paymentCard}>
          <Stack align="center" gap="md">
            <AlertCircle size={48} color="#ff6b6b" />
            <Text ta="center" size="lg" c="white">
              No se encontró información de la reserva
            </Text>
            <Button 
              onClick={() => navigate({ to: '/reservar' })}
              variant="light"
            >
              Volver a reservas
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={styles.paymentContainer}>
      <Card className={styles.paymentCard}>
        <Stepper 
          active={active} 
          size="sm" 
          classNames={{ 
            stepIcon: styles.stepperIcon,
            separator: styles.stepperSeparator 
          }}
        >
          <Stepper.Step 
            label="Método de pago" 
            description="Selecciona tu método de pago"
            icon={<Landmark size={18} />}
          >
            <Stack gap="xl">
              <Title order={4} c="white">Selecciona método de pago</Title>
              
              <Stack gap="md">
                <Select
                  className={styles.input}
                  label="Método de pago"
                  value={paymentMethod}
                  onChange={(value) => value && setPaymentMethod(value)}
                  data={[
                    { value: 'credit', label: 'Tarjeta de Crédito' },
                    { value: 'debit', label: 'Tarjeta de Débito' }
                  ]}
                  styles={{
                    label: { color: 'white' },
                    input: { color: 'white' }
                  }}
                />

                <Card className={styles.tripSummary}>
                  <Stack gap="xs">
                    <Text c="dimmed">Detalles del viaje:</Text>
                    <Group gap="apart">
                      <Text>Origen:</Text>
                      <Text fw={500}>{trip.origin.address}</Text>
                    </Group>
                    <Group gap="apart">
                      <Text>Destino:</Text>
                      <Text fw={500}>{trip.destination.address}</Text>
                    </Group>
                    <Group gap="apart">
                      <Text>Fecha:</Text>
                      <Text fw={500}>{dayjs(trip.dateTime).format('DD/MM/YYYY HH:mm')}</Text>
                    </Group>
                  </Stack>
                </Card>

                <div className={styles.summary}>
                  <Stack gap="xs">
                    <Group gap="apart">
                      <Text c="white">Precio por cupo:</Text>
                      <Text c="white">${trip.pricePerSeat.toLocaleString()}</Text>
                    </Group>
                    <Group gap="apart">
                      <Text c="white">Cantidad de cupos:</Text>
                      <Text c="white">{currentReservation.passengersCount}</Text>
                    </Group>
                    <Group gap="apart" mt="md">
                      <Text fw={500} c="white">Total a pagar:</Text>
                      <Text size="xl" fw={700} className={styles.price}>
                        ${currentReservation.totalPrice.toLocaleString()}
                      </Text>
                    </Group>
                  </Stack>
                </div>
              </Stack>

              <Button 
                onClick={nextStep} 
                fullWidth 
                size="lg"
                className={styles.confirmButton}
              >
                Continuar al pago
              </Button>
            </Stack>
          </Stepper.Step>

          <Stepper.Step 
            label="Detalles de pago" 
            description="Ingresa los datos de tu tarjeta"
            icon={<CreditCard size={18} />}
          >
            <Stack gap="xl">
              <Title order={4} c="white">Ingresa los datos de tu tarjeta</Title>

              <div className={styles.cardForm}>
                <TextInput
                  className={styles.input}
                  label="Número de tarjeta"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={handleCardNumberChange}
                  error={errors.number}
                  maxLength={19}
                  styles={{
                    label: { color: 'white' },
                    input: { color: 'white' }
                  }}
                />

                <Group grow>
                  <TextInput
                    className={styles.input}
                    label="Fecha de expiración"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleExpiryChange}
                    error={errors.expiry}
                    maxLength={5}
                    styles={{
                      label: { color: 'white' },
                      input: { color: 'white' }
                    }}
                  />
                  
                  <TextInput
                    className={styles.input}
                    label="CVV"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    error={errors.cvv}
                    maxLength={4}
                    styles={{
                      label: { color: 'white' },
                      input: { color: 'white' }
                    }}
                  />
                </Group>

                <TextInput
                  className={styles.input}
                  label="Nombre del titular"
                  placeholder="Como aparece en la tarjeta"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  error={errors.name}
                  styles={{
                    label: { color: 'white' },
                    input: { color: 'white' }
                  }}
                />
              </div>

              <Card className={styles.summary}>
                <Stack gap="xs">
                  <Text fw={500} c="white">Resumen del pago:</Text>
                  <Group gap="apart">
                    <Text c="white">Total a pagar:</Text>
                    <Text size="xl" fw={700} className={styles.price}>
                      ${currentReservation.totalPrice.toLocaleString()}
                    </Text>
                  </Group>
                </Stack>
              </Card>

              <Button
                onClick={handlePayment}
                fullWidth
                size="lg"
                className={styles.confirmButton}
              >
                Pagar ${currentReservation.totalPrice.toLocaleString()}
              </Button>
            </Stack>
          </Stepper.Step>
        </Stepper>
      </Card>

      <Modal
        opened={showSuccess}
        onClose={() => {}}
        withCloseButton={false}
        centered
        styles={{
          root: { backgroundColor: '#0a0a0a' },
          body: { color: 'white' }
        }}
      >
        <Stack align="center" py="xl">
          <div className={styles.successIcon}>
            <Check size={32} />
          </div>
          <Title order={3} ta="center" c="white">
            ¡Pago realizado con éxito!
          </Title>
          <Text size="lg" c="dimmed" ta="center">
            Serás redirigido para confirmar los datos del viaje
          </Text>
        </Stack>
      </Modal>
    </Container>
  );
}

export const Route = createFileRoute('/PagarCupo/')({
  component: PaymentProcess
});
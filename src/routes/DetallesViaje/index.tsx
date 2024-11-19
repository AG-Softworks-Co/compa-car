import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Button,
  UnstyledButton,
  Card,
  Group,
  Stack,
  Badge,
  NumberInput,
  NumberInputProps,
  Textarea,
  Switch,
  ActionIcon,
  Popover,
  Modal,
} from '@mantine/core';
import { 
  ArrowLeft, 
  Clock, 
  Navigation, 
  Users, 
  DollarSign,
  Calendar,
  Check,

} from 'lucide-react';
import { MantineTheme , } from '@mantine/core';
import { DateTimePicker ,} from '@mantine/dates';
import { tripStore, TripData } from '../../types/PublicarViaje/TripDataManagement';
import { saveToLocalStorage, getFromLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import styles from './index.module.css';

// Interfaces
interface CustomTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

interface TimeComponentState {
  hour: string;
  minute: string;
  period: string;
}

interface FormattedNumberInputProps extends Omit<NumberInputProps, 'onChange'> {
  onChange: (value: number) => void;
  formatter?: (value: string) => string;
  parser?: (value: string) => string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    tripData: TripData;
    dateTime: Date | null;  // Cambiado de date y time a dateTime
    seats: number;
    pricePerSeat: number;
    description: string;
    allowPets: boolean;
    allowSmoking: boolean;
  };
}
// Componente para previsualización de información
const PreviewInfo: React.FC<PreviewModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
  if (!data.tripData.selectedRoute) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Vista previa del viaje"
      size="lg"
      centered
      classNames={{
        header: styles.previewHeader,
        title: styles.previewTitle
      }}
    >
      <Stack gap="xl">
        <Card className={styles.previewCard}>
          <Stack gap="md">
            <Group gap="apart">
              <div>
                <Text fw={500} size="lg">Fecha y Hora</Text>
                <Text>
  {data.dateTime 
    ? dayjs(data.dateTime).format('DD MMM YYYY hh:mm A')
    : ''}
</Text>
              </div>
              <Badge 
                size="lg" 
                variant="gradient" 
                gradient={{ from: 'teal', to: 'lime' }}
              >
                {data.tripData.selectedRoute.duration}
              </Badge>
            </Group>

            <div className={styles.locationPreview}>
              <Text fw={500}>Origen</Text>
              <Text className={styles.locationText}>
                {data.tripData.origin?.address}
              </Text>
              <div className={styles.previewSeparator} />
              <Text fw={500}>Destino</Text>
              <Text className={styles.locationText}>
                {data.tripData.destination?.address}
              </Text>
            </div>

            <Group grow>
              <Card className={styles.infoCard}>
                <Group gap="sm">
                  <Users className={styles.infoIcon} />
                  <div>
                    <Text size="sm" fw={500}>Asientos</Text>
                    <Text size="xl" fw={600}>{data.seats}</Text>
                  </div>
                </Group>
              </Card>

              <Card className={styles.infoCard}>
                <Group  gap="sm">
                  <DollarSign className={styles.infoIcon} />
                  <div>
                    <Text size="sm" fw={500}>Precio por asiento</Text>
                    <Text size="xl" fw={600}>
                      ${data.pricePerSeat.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Group>

            {data.description && (
              <div className={styles.descriptionPreview}>
                <Text fw={500}>Descripción</Text>
                <Text>{data.description}</Text>
              </div>
            )}

            <div className={styles.preferencesPreview}>
              <Text fw={500} mb="sm">Preferencias</Text>
              <Group>
                <Badge 
                  color={data.allowPets ? "teal" : "red"}
                  variant="light"
                  size="lg"
                >
                  {data.allowPets ? "Mascotas permitidas" : "No se permiten mascotas"}
                </Badge>
                <Badge 
                  color={data.allowSmoking ? "teal" : "red"}
                  variant="light"
                  size="lg"
                >
                  {data.allowSmoking ? "Se permite fumar" : "No se permite fumar"}
                </Badge>
              </Group>
            </div>
          </Stack>
        </Card>

        <Group  gap="md">
          <Button 
            variant="default" 
            onClick={onClose}
            className={styles.previewButton}
          >
            Editar
          </Button>
          <Button
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            Confirmar y publicar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// Componente de NumberInput personalizado con formato
function FormattedNumberInput({
  value,
  onChange,
  formatter,
  parser,
  ...props
}: FormattedNumberInputProps) {
  const handleChange = (val: string | number) => {
    const numericValue = typeof val === 'string' ? parseFloat(val) : val;
    onChange(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <NumberInput
      value={value}
      onChange={handleChange}
      {...props}
      styles={{
        input: (theme: MantineTheme) => ({
          borderColor: theme.colors.gray[4],
          '&:focus': {
            borderColor: theme.colors.blue[6],
          },
        }),
      }}
    />
  );
}


// Componente personalizado para el selector de hora
function CustomTimeInput({ value, onChange, error }: CustomTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const [timeState, setTimeState] = useState<TimeComponentState>({
    hour: '',
    minute: '',
    period: 'AM'
  });

  useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [hour, minute] = time.split(':');
      setTimeState({
        hour,
        minute,
        period: period || 'AM'
      });
    }
  }, [value]);

  const handleTimeSelect = (hour: number, minute: string, period: string) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const timeString = `${formattedHour}:${minute} ${period}`;
    onChange(timeString);
    setTimeState({
      hour: formattedHour,
      minute,
      period
    });
    setIsOpen(false);
  };

  return (
    <Popover
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      position="bottom"
      width={300}
      shadow="md"
      classNames={{
        dropdown: styles.timeDropdown
      }}
    >
      <Popover.Target>
        <div className={styles.timeInputWrapper}>
          <input
            type="text"
            value={value}
            readOnly
            placeholder="Selecciona hora"
            className={`${styles.timeInput} ${error ? styles.timeInputError : ''}`}
            onClick={() => setIsOpen(true)}
          />
          <ActionIcon 
            className={styles.timeInputIcon}
            onClick={() => setIsOpen(true)}
          >
            <Clock size={18} />
          </ActionIcon>
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <div className={styles.timeSelector}>
          <div className={styles.timeSelectorHeader}>
            <Text fw={500}>Selecciona la hora</Text>
          </div>
          <div className={styles.timeSelectorContent}>
            <div className={styles.hoursGrid}>
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={`${styles.timeOption} ${
                    timeState.hour === hour.toString().padStart(2, '0') ? styles.selected : ''
                  }`}
                  onClick={() => setTimeState(prev => ({ 
                    ...prev, 
                    hour: hour.toString().padStart(2, '0')
                  }))}
                >
                  {hour}
                </button>
              ))}
            </div>
            <div className={styles.minutesGrid}>
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={`${styles.timeOption} ${
                    timeState.minute === minute ? styles.selected : ''
                  }`}
                  onClick={() => setTimeState(prev => ({ ...prev, minute }))}
                >
                  {minute}
                </button>
              ))}
            </div>
            <div className={styles.periodGrid}>
              {periods.map((period) => (
                <button
                  key={period}
                  type="button"
                  className={`${styles.timeOption} ${
                    timeState.period === period ? styles.selected : ''
                  }`}
                  onClick={() => {
                    if (timeState.hour && timeState.minute) {
                      handleTimeSelect(
                        parseInt(timeState.hour),
                        timeState.minute,
                        period
                      );
                    }
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

function DetallesViajeView() {
  const navigate = useNavigate();
  const [tripData] = useState<TripData>(tripStore.getStoredData());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [seats, setSeats] = useState<number>(1);
  const [pricePerSeat, setPricePerSeat] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [allowPets, setAllowPets] = useState<boolean>(false);
  const [allowSmoking, setAllowSmoking] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!tripData.selectedRoute || !tripData.origin || !tripData.destination) {
      navigate({ to: '/publicarviaje' });
    }
  }, [tripData, navigate]);

  const validateForm = () => {
    if (!dateTime) {
      setFormError('Selecciona la fecha y hora del viaje');
      return false;
    }
  
    if (dayjs(dateTime).isBefore(dayjs())) {
      setFormError('La fecha y hora deben ser posteriores al momento actual');
      return false;
    }
  
    if (seats < 1 || seats > 6) {
      setFormError('El número de asientos debe estar entre 1 y 6');
      return false;
    }
  
    if (pricePerSeat <= 0) {
      setFormError('Ingresa un precio válido por asiento');
      return false;
    }
  
    if (!description.trim()) {
      setFormError('Agrega una descripción del viaje');
      return false;
    }
  
    return true;
  };

  const handlePreviewClick = () => {
    if (validateForm()) {
      setShowPreviewModal(true);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
  
    const tripDetails = {
      id: Date.now().toString(),
      ...tripData,
      dateTime: dateTime?.toISOString(),
      seats,
      pricePerSeat,
      description,
      allowPets,
      allowSmoking,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  
    try {
      const existingTrips = getFromLocalStorage<TripData[]>('publishedTrips') || [];
      saveToLocalStorage('publishedTrips', [...existingTrips, tripDetails]);
      setShowPreviewModal(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate({ to: '/ViajesPublicados' });
      }, 2000);
    } catch (error) {
      setFormError('Error al guardar el viaje. Intenta nuevamente.');
    }
  };

  if (!tripData.selectedRoute) return null;

  return (
    <Container fluid className={styles.container}>
      <div className={styles.header}>
        <UnstyledButton
          onClick={() => navigate({ to: '/publicarviaje' })}
          className={styles.backButton}
        >
          <ArrowLeft size={24} />
        </UnstyledButton>
        <Title className={styles.headerTitle}>Detalles del viaje</Title>
      </div>

      <Container size="sm" className={styles.content}>
        <Card className={styles.routeCard}>
          <Stack gap="md">
            <Group gap="xs">
              <Badge leftSection={<Clock size={14} />} className={styles.routeBadge}>
                {tripData.selectedRoute.duration}
              </Badge>
              <Badge leftSection={<Navigation size={14} />} className={styles.routeBadge}>
                {tripData.selectedRoute.distance}
              </Badge>
            </Group>

            <div className={styles.locationInfo}>
              <Text className={styles.locationTitle}>Origen</Text>
              <Text className={styles.locationAddress}>
                {tripData.origin?.address}
              </Text>
              <div className={styles.routeLine} />
              <Text className={styles.locationTitle}>Destino</Text>
              <Text className={styles.locationAddress}>
                {tripData.destination?.address}
              </Text>
            </div>

            <Text size="sm" c="dimmed">
              Vía {tripData.selectedRoute.summary}
            </Text>
          </Stack>
        </Card>

        <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
          <Stack gap="xl">
          <div className={styles.dateTimeSection}>
  <Card className={styles.dateCard}>
    <Group gap="apart" mb="md">
      <div>
        <Text fw={500}>Fecha y hora del viaje</Text>
        <Text size="sm" c="dimmed">Selecciona cuándo saldrás</Text>
      </div>
      <Calendar size={24} className={styles.dateIcon} />
    </Group>
    
    <DateTimePicker
  label="Fecha y hora del viaje"
  description="Selecciona cuándo saldrás"
  placeholder="Selecciona fecha y hora"
  value={dateTime}
  onChange={setDateTime}
  valueFormat="DD MMM YYYY hh:mm A"
  locale="es"
  clearable={false}
  minDate={dayjs().add(1, 'day').toDate()}
  required
  error={formError && formError.includes('fecha') ? formError : null}
  leftSection={<Calendar size={18} />}
  styles={(theme) => ({
    input: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)',
      height: '48px',
      '&:focus': {
        borderColor: 'var(--primary)',
      },
    },
    dropdown: {
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
    },
  })}
/>
  </Card>
</div>

            <Group grow>
              <FormattedNumberInput
                label="Asientos disponibles"
                description="Máximo 6 asientos"
                value={seats}
                onChange={setSeats}
                min={1}
                max={6}
                required
                leftSection={<Users size={18} />}
                error={formError && formError.includes('asientos') ? formError : null}
              />
              
              <FormattedNumberInput
                label="Precio por asiento"
                description="En COP"
                value={pricePerSeat}
                onChange={setPricePerSeat}
                min={1000}
                required
                leftSection={<DollarSign size={18} />}
                error={formError && formError.includes('precio') ? formError : null}
                formatter={(value) => !value ? '$ 0' : `$ ${parseInt(value).toLocaleString()}`}
                parser={(value) => value.replace(/[^\d]/g, '')}
              />
            </Group>

            <Textarea
              label="Descripción del viaje"
              description="Añade información importante para los pasajeros"
              placeholder="Punto de encuentro, equipaje permitido..."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              minRows={3}
              maxRows={5}
              required
              error={formError && formError.includes('descripción') ? formError : null}
            />

            <Card className={styles.preferencesCard}>
              <Title order={5}>Preferencias del viaje</Title>
              <Group mt="md">
                <Switch
                  label="Mascotas permitidas"
                  checked={allowPets}
                  onChange={(e) => setAllowPets(e.currentTarget.checked)}
                  size="lg"
                />
                <Switch
                  label="Se permite fumar"
                  checked={allowSmoking}
                  onChange={(e) => setAllowSmoking(e.currentTarget.checked)}
                  size="lg"
                />
              </Group>
            </Card>

            {formError && (
              <Text color="red" size="sm" className={styles.errorText}>
                {formError}
              </Text>
            )}

            <Button
              onClick={handlePreviewClick}
              size="lg"
              className={styles.submitButton}
            >
              Vista previa
            </Button>
          </Stack>
        </form>

        <PreviewInfo
  isOpen={showPreviewModal}
  onClose={() => setShowPreviewModal(false)}
  onConfirm={handleSubmit}
  data={{
    tripData,
    dateTime,  // Cambiado de date y time a dateTime
    seats,
    pricePerSeat,
    description,
    allowPets,
    allowSmoking
  }}
/>

        {showSuccessModal && (
          <Modal
            opened={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            withCloseButton={false}
            centered
            classNames={{
              header: styles.modalHeader,
              title: styles.modalTitle,
              body: styles.modalBody,
            }}
          >
            <Stack align="center" gap="md" py="xl">
              <div className={styles.successIcon}>
                <Check 
                  size={32} 
                  strokeWidth={2} 
                  className={styles.successCheck}
                />
              </div>
              <Stack align="center" gap={4}>
                <Text size="lg" fw={600} ta="center" className={styles.modalTitle}>
                  ¡Viaje publicado exitosamente!
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Serás redirigido a tus viajes publicados
                </Text>
              </Stack>
            </Stack>
          </Modal>
        )}
      </Container>
    </Container>
  );
}

export const Route = createFileRoute('/DetallesViaje/')({
  component: DetallesViajeView,
});

export default DetallesViajeView;
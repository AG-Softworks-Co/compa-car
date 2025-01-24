import type React from 'react';
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
    type NumberInputProps,
    Textarea,
    Switch,
    Modal,
    LoadingOverlay,
} from '@mantine/core';
import {
    ArrowLeft,
    Clock,
    Navigation,
    Users,
    DollarSign,
    Calendar,
    Check,
    MapPin,
} from 'lucide-react';
import type { MantineTheme, } from '@mantine/core';
import { DateTimePicker, } from '@mantine/dates';
import { tripStore, type TripData, type TripStopover } from '../../types/PublicarViaje/TripDataManagement';
import { saveToLocalStorage, getFromLocalStorage } from '../../types/PublicarViaje/localStorageHelper';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import styles from './index.module.css';

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
        dateTime: Date | null;
        seats: number;
        pricePerSeat: number;
        description: string;
        allowPets: boolean;
        allowSmoking: boolean;
        stopovers: TripStopover[];
    };
}


const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

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
                       {data.stopovers && data.stopovers.length > 0 && (
                            <div className={styles.stopoverPreview}>
                                <Text fw={500} mb="sm">Paradas</Text>
                                <Group gap="md">
                                    {data.stopovers.map((stopover, index) => (
                                        <div key={index} className={styles.stopItem}>
                                            <MapPin size={16} className={styles.stopIcon} />
                                            <Text>
                                                {stopover.location.mainText}
                                                {stopover.location.postalCode ? ` (${stopover.location.postalCode})` : ''}
                                            </Text>
                                        </div>
                                    ))}
                                </Group>
                            </div>
                        )}
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
                                <Group gap="sm">
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

                <Group gap="md">
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

function FormattedNumberInput({
    value,
    onChange,
    formatter,
    parser,
    ...props
}: FormattedNumberInputProps) {
    const handleChange = (val: string | number) => {
        const numericValue = typeof val === 'string' ? Number.parseFloat(val) : val;
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

function DetallesViajeView() {
    const navigate = useNavigate();
    const [tripData] = useState<TripData>(tripStore.getStoredData());
    const [seats, setSeats] = useState<number>(1);
    const [pricePerSeat, setPricePerSeat] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [allowPets, setAllowPets] = useState<boolean>(false);
    const [allowSmoking, setAllowSmoking] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
    const [dateTime, setDateTime] = useState<Date | null>(null);
    const [stopovers, setStopovers] = useState<TripStopover[]>([]);
     const [loading, setLoading] = useState(false);


    useEffect(() => {
        const storedData = tripStore.getStoredData();
        setStopovers(storedData?.stopovers || []);
        console.log("Datos del viaje en Detalles:", storedData);

        if (!storedData.selectedRoute || !storedData.origin || !storedData.destination) {
            navigate({ to: '/publicarviaje' });
        }
    }, [navigate]);


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

    const createLocation = async (locationData: any): Promise<any> => {
        const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found');
            throw new Error('No token found');
          }
        try {
            const checkLocationResponse = await fetch(`${BASE_URL}/locations/placeid/${encodeURIComponent(locationData.place_id)}`, {
                 headers: {
                    'x-token': token,
                }
            });

            if (checkLocationResponse.ok) {
                 const checkLocationData = await checkLocationResponse.json();
                 if (checkLocationData.data) {
                     console.log("Location already exists:", checkLocationData.data);
                     return checkLocationData.data;
                   }
            }

            const response = await fetch(`${BASE_URL}/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token,
                },
                body: JSON.stringify(locationData),
            });


            if (!response.ok) {
               const errorData = await response.json();
                console.error("Error creating location:", errorData);
                 throw new Error(errorData.msj || 'Failed to create location');
            }

            const data = await response.json();
            console.log("Location created:", data);
            return data.data;
        } catch (error:any) {
           console.error("Error creating or fetching location:", error.message);
             throw new Error(error.message);
        }
    };

    const createRoute = async (routeData: any): Promise<any> => {
         const token = localStorage.getItem('token');
           if (!token) {
            console.error('No token found');
            throw new Error('No token found');
          }
        try {
            const response = await fetch(`${BASE_URL}/routes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     'x-token': token,
                },
                body: JSON.stringify(routeData),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                console.error('Error creating route:', errorData);
                  throw new Error(errorData.msj || 'Failed to create route');
            }

            const data = await response.json();
            console.log('Route created:', data);
            return data.data;

        } catch (error: any) {
           console.error('Error creating route:', error.message);
             throw new Error(error.message);
        }
    };

    const createTrip = async (tripData: any): Promise<any> => {
        const token = localStorage.getItem('token');
           if (!token) {
            console.error('No token found');
            throw new Error('No token found');
          }
        try {
            const response = await fetch(`${BASE_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token,
                },
                body: JSON.stringify(tripData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating trip:', errorData);
                throw new Error(errorData.msj || 'Failed to create trip');
            }

             const data = await response.json();
             console.log('Trip created:', data);
             return data.data;
        } catch (error: any) {
            console.error('Error creating trip:', error.message);
              throw new Error(error.message)
        }
    };
     const createStopover = async (stopoverData: any): Promise<any> => {
          const token = localStorage.getItem('token');
           if (!token) {
            console.error('No token found');
            throw new Error('No token found');
          }
         try {
            const response = await fetch(`${BASE_URL}/stopovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                      'x-token': token,
                },
                body: JSON.stringify(stopoverData),
            });
             if (!response.ok) {
                  const errorData = await response.json();
                console.error('Error creating stopover:', errorData);
               throw new Error(errorData.msj || 'Failed to create stopover');
            }

            const data = await response.json();
            console.log('Stopover created:', data);
             return data.data;
        } catch (error: any) {
            console.error('Error creating stopover:', error.message);
            throw new Error(error.message)
        }
    };

      const fetchVehicleId = async (userId: number): Promise<number | null> => {
           const token = localStorage.getItem('token');
           if (!token) {
            console.error('No token found');
            throw new Error('No token found');
          }
        try {
            const response = await fetch(`${BASE_URL}/vehicles/userid/${userId}`, {
                headers: {
                   'x-token': token,
                }
            });

            if (!response.ok) {
                 const errorData = await response.json();
                console.error('Error fetching vehicle:', errorData);
                throw new Error(errorData.msj || 'Failed to fetch vehicle');
            }


            const data = await response.json();
            if (data.data && data.data.length > 0) {
              console.log('Vehicle ID fetched:', data.data[0].id);
              return data.data[0].id;
             } else {
                console.error('No vehicle found for this user')
                return null;
            }
        } catch (error: any) {
            console.error('Error fetching vehicle ID:', error.message);
              throw new Error(error.message);
              return null;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
         setLoading(true);
        try {
            if (!tripData.selectedRoute || !tripData.origin || !tripData.destination) {
                setFormError("Los datos del viaje son incompletos.");
                return;
            }
             const userId = localStorage.getItem('userId');
            if (!userId) {
                setFormError("Usuario no autenticado.");
                return;
            }

             const vehicleId = await fetchVehicleId(Number.parseInt(userId));
            if (!vehicleId) {
                setFormError("No se pudo encontrar el id del vehiculo para este usuario.");
                return;
            }

            const originLocationData = {
                place_id: tripData.origin.placeId,
                address: tripData.origin.address,
                latitude: tripData.origin.coords.lat,
                longitude: tripData.origin.coords.lng,
               postal_code: tripData.origin.postalCode,
                main_text: tripData.origin.mainText,
                secondary_text: tripData.origin.secondaryText,
            };

            const destinationLocationData = {
                place_id: tripData.destination.placeId,
                address: tripData.destination.address,
                latitude: tripData.destination.coords.lat,
                longitude: tripData.destination.coords.lng,
                 postal_code: tripData.destination.postalCode,
                 main_text: tripData.destination.mainText,
                 secondary_text: tripData.destination.secondaryText,
            };

            const createdOriginLocation = await createLocation(originLocationData);
             if (!createdOriginLocation) {
                 setFormError("No se pudo crear la location de origen.");
                 return;
             }
            const createdDestinationLocation = await createLocation(destinationLocationData);
              if (!createdDestinationLocation) {
                 setFormError("No se pudo crear la location de destino.");
                 return;
               }


            const routeData = {
                index: tripData.selectedRoute.index,
                distance: tripData.selectedRoute.distance,
                duration: tripData.selectedRoute.duration,
                summary: tripData.selectedRoute.summary,
                start_address: tripData.selectedRoute.startAddress,
                end_address: tripData.selectedRoute.endAddress,
            };

            const createdRoute = await createRoute(routeData);
             if (!createdRoute) {
                  setFormError("No se pudo crear la ruta.");
                 return;
              }

            const tripDetails = {
                origin_id: createdOriginLocation.location_id,
                destination_id: createdDestinationLocation.location_id,
                route_id: createdRoute.route_id,
                user_id: Number.parseInt(userId),
                vehicle_id: vehicleId,
                date_time: dateTime?.toISOString().replace('T', ' ').slice(0, 19),
                seats,
                price_per_seat: pricePerSeat,
                description,
                allow_pets: allowPets,
                allow_smoking: allowSmoking,
            };

            const createdTrip =  await createTrip(tripDetails)
            if (!createdTrip) {
                 setFormError("No se pudo crear el viaje.");
                 return;
               }
            
              // Handle stopovers
            if (stopovers && stopovers.length > 0) {
                for (const [index, stopover] of stopovers.entries()) {
                      const stopoverLocationData = {
                        place_id: stopover.location.placeId,
                        address: stopover.location.address,
                        latitude: stopover.location.coords.lat,
                        longitude: stopover.location.coords.lng,
                          postal_code: stopover.location.postalCode,
                            main_text: stopover.location.mainText,
                            secondary_text: stopover.location.secondaryText,
                     };
                  
                        const createdStopoverLocation = await createLocation(stopoverLocationData);

                        if(createdStopoverLocation){
                         const stopoverData = {
                           trip_id: createdTrip.trip_id,
                           location_id: createdStopoverLocation.location_id,
                           order: index + 1,
                             estimated_time: '5 minutes', // Default value for estimated time
                           };
                         await createStopover(stopoverData);
                       }else{
                           console.error("Failed to create location for stopover", stopover)
                       }
               }
          }

            const tripDetailsLocal = {
                id: Date.now().toString(),
                ...tripData,
                dateTime: dateTime?.toISOString(),
                seats,
                pricePerSeat,
                description,
                allowPets,
                allowSmoking,
                status: 'active',
                createdAt: new Date().toISOString(),
                stopovers: stopovers,
            };

            const existingTrips = getFromLocalStorage<TripData[]>('publishedTrips') || [];
            saveToLocalStorage('publishedTrips', [...existingTrips, tripDetailsLocal]);

            setShowPreviewModal(false);
            setShowSuccessModal(true);

             setTimeout(() => {
                navigate({ to: '/Actividades' });
            }, 2000);
        } catch (error:any) {
            console.error("Error durante el proceso de publicación del viaje", error.message);
            setFormError('Error al guardar el viaje. Intenta nuevamente.');
        }
        finally{
            setLoading(false)
        }
    };

    if (!tripData.selectedRoute) return null;

    return (
        <Container fluid className={styles.container}>
           <LoadingOverlay visible={loading}/>
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
                          {stopovers && stopovers.length > 0 && (
                            <div className={styles.stopoverSection}>
                                <Text fw={500} mb="sm">Paradas</Text>
                                <Group gap="md">
                                    {stopovers.map((stopover, index) => (
                                        <div key={index} className={styles.stopItem}>
                                            <MapPin size={16} className={styles.stopIcon} />
                                            <Text>
                                                {stopover.location.mainText}
                                                {stopover.location.postalCode ? ` (${stopover.location.postalCode})` : ''}
                                            </Text>
                                        </div>
                                    ))}
                                </Group>
                            </div>
                        )}
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
                                formatter={(value) => !value ? '$ 0' : `$ ${Number.parseInt(value).toLocaleString()}`}
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
                        dateTime,
                        seats,
                        pricePerSeat,
                        description,
                        allowPets,
                        allowSmoking,
                        stopovers,
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
// ViewBookingDetails.tsx
import React, { useState, useEffect } from 'react';
import { Card, Stack, Group, Text, Button, LoadingOverlay, Badge } from '@mantine/core';
import styles from './index.module.css';
import detailStyles from './ViewBookingDetails.module.css';
import dayjs from 'dayjs';
import { Booking } from '../../components/Cupos/types';
import { createFileRoute } from '@tanstack/react-router';
import { showNotification } from '@mantine/notifications';

interface ViewBookingDetailsProps {
    booking?: Booking;
    onClose: () => void;
    token: string;
}

interface TripDetails {
    main_text_origen: string;
    main_text_destination: string;
    date_time: string | null;
    driverName: string;
    loading: boolean;
    tripStatus: string;
    vehicle: {
        brand: string;
        model: string;
        year: number;
        plate: string;
        color: string;
    };
}

interface TripDetailsResponse {
  ok: boolean;
  data: TripDetailsData[]
}

interface TripDetailsData {
     passenger_id: number;
    full_name: string;
    identification_number: string;
    booking_qr: string;
     status_passenger: string;
    payment_id: number;
    payment_date: string;
    payment_method: string;
     amount: string;
    payment_status: string;
     booking_id: number;
    seats_booked: number;
     booking_date: string;
    total_price: string;
    booking_status: string;
    booking_message: string;
    trip_id: number;
    origin_id: number;
    destination_id: number;
    route_id: number;
    user_id: number;
     vehicle_id: number;
    date_time: string;
   seats: number;
    price_per_seat: string;
     description: string;
    allow_pets: number;
    allow_smoking: number;
    status: string;
    created_at: string;
    main_text_origen: string;
    secondary_text_origen: string;
    main_text_destination: string;
    secondary_text_destination: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
     body_type: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: string;
    distance: string;
    duration: string;
    summary: string;
}

const ViewBookingDetails: React.FC<ViewBookingDetailsProps> = ({ booking, onClose, token }) => {
    const [tripDetails, setTripDetails] = useState<TripDetails>({
        main_text_origen: '',
        main_text_destination: '',
        date_time: null,
        driverName: '',
        loading: true,
        tripStatus: '',
        vehicle: {
            brand: '',
            model: '',
            year: 0,
            plate: '',
            color: ''
        }
    });

    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!booking || !booking.trip_id) {
                console.error("No booking or trip_id found");
                return;
            }
              setTripDetails(prev => ({ ...prev, loading: true }));
             const url = `https://rest-sorella-production.up.railway.app/api/passengers/tripid_det/${booking.trip_id}`;
            console.log("Fetching trip details from:", url);
            try {
                   const response = await fetch(
                     url,
                    {
                        headers: { 'x-token': token },
                    }
                 );
                 console.log("Raw response:", response);
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error fetching trip details:', errorData);
                    showNotification({
                        title: 'Error al obtener detalles del viaje',
                       message: `Hubo un error al cargar los detalles del viaje desde el servidor. Detalle: ${
                           errorData.msj || 'Desconocido'
                       }`,
                        color: 'red',
                    });
                     setTripDetails(prev => ({ ...prev, loading: false }));
                     return;
                }
                 const responseData = await response.json() as TripDetailsResponse;
                    console.log("Parsed JSON:", responseData);
               if (!responseData.data || !Array.isArray(responseData.data) || responseData.data.length === 0 ) {
                    console.error('Invalid response from API: data array not found', responseData);
                    showNotification({
                        title: 'Error al obtener las detalles del viaje',
                         message: 'La respuesta del servidor no tiene el formato esperado o no se encontraron los datos.',
                        color: 'red',
                    });
                      setTripDetails(prev => ({ ...prev, loading: false }));
                   return;
              }
               const tripData = responseData.data[0] as TripDetailsData;
                 setTripDetails({
                     main_text_origen: tripData?.secondary_text_origen || '',
                     main_text_destination: tripData?.secondary_text_destination || '',
                     date_time: tripData?.date_time || null,
                    driverName: `${tripData?.first_name || ''} ${tripData?.last_name || ''}`,
                    loading: false,
                    tripStatus: tripData.status || '',
                     vehicle: {
                       brand: tripData?.brand || '',
                        model: tripData?.model || '',
                         year: tripData?.year || 0,
                         plate: tripData?.plate || '',
                         color: tripData?.color || ''
                   }
               });
           } catch (error) {
               console.error('Error fetching trip details:', error);
               showNotification({
                    title: 'Error al obtener detalles del viaje',
                     message:
                       'Hubo un error al cargar los detalles del viaje desde el servidor. Intenta de nuevo más tarde.',
                    color: 'red',
               });
                 setTripDetails(prev => ({ ...prev, loading: false }));
            }
       };
       fetchTripDetails();
    }, [booking, token]);


    if (!booking) return null;

    return (
        <Card className={`${styles.cupoCard} ${detailStyles.detailsCard}`}>
            <LoadingOverlay visible={tripDetails.loading} />
            <Stack gap="xs">
                   <Group gap="apart" className={detailStyles.detailItem}>
                    <Text fw={600} className={detailStyles.detailLabel}>ID de la reserva:</Text>
                     <Text className={detailStyles.detailValue}>{booking.booking_id}</Text>
                </Group>
                 <Group gap="apart" className={detailStyles.detailItem}>
                       <Text fw={600} className={detailStyles.detailLabel}>ID del viaje:</Text>
                       <Text className={detailStyles.detailValue}>{booking.trip_id}</Text>
                  </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                   <Text fw={600} className={detailStyles.detailLabel}>Conductor:</Text>
                     <Text className={detailStyles.detailValue}>{tripDetails.driverName}</Text>
                </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                    <Text fw={600} className={detailStyles.detailLabel}>Origen:</Text>
                     <Text className={detailStyles.detailValue}>{tripDetails.main_text_origen}</Text>
                 </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                   <Text fw={600} className={detailStyles.detailLabel}>Destino:</Text>
                   <Text className={detailStyles.detailValue}>{tripDetails.main_text_destination}</Text>
                </Group>
                 <Group gap="apart" className={detailStyles.detailItem}>
                   <Text fw={600} className={detailStyles.detailLabel}>Fecha y Hora:</Text>
                    <Text className={detailStyles.detailValue}>{tripDetails.date_time ? dayjs(tripDetails.date_time).format('DD/MM/YYYY HH:mm') : 'No disponible'}</Text>
                </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                     <Text fw={600} className={detailStyles.detailLabel}>Mensaje:</Text>
                     <Text className={detailStyles.detailValue}>{booking.booking_message}</Text>
                 </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                     <Text fw={600} className={detailStyles.detailLabel}>Estado:</Text>
                    <Badge color={tripDetails.tripStatus === 'active' ? 'green' : 'yellow'} variant="filled">{booking.booking_status}</Badge>
                 </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                     <Text fw={600} className={detailStyles.detailLabel}>Precio Total:</Text>
                      <Text className={detailStyles.detailValue}>${booking.total_price?.toLocaleString()}</Text>
                 </Group>
                <Group gap="apart" className={detailStyles.detailItem}>
                   <Text fw={600} className={detailStyles.detailLabel}>Vehiculo:</Text>
                    <Text className={detailStyles.detailValue}>{`${tripDetails.vehicle.brand} ${tripDetails.vehicle.model} (${tripDetails.vehicle.year}) - ${tripDetails.vehicle.plate} - ${tripDetails.vehicle.color}`}</Text>
                </Group>
                <Button onClick={onClose} mt="md" size="xs" className={detailStyles.closeButton}>
                    Cerrar Detalles
                </Button>
            </Stack>
        </Card>
    );
};

export const Route = createFileRoute('/Cupos/ViewBookingDetails')({
    component: ViewBookingDetails,
})
export default ViewBookingDetails;
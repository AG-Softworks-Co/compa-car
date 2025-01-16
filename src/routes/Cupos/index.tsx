// Cupos.tsx
import React, { useState, useEffect } from 'react';
import { Container, Title, Text, LoadingOverlay, Card, Group, Stack, List, Button, Menu, Transition } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import styles from './index.module.css';
import { createFileRoute } from '@tanstack/react-router';
import * as Icons from 'lucide-react';

interface Passenger {
    passenger_id: number;
    full_name: string;
    identification_number: string;
    booking_qr: string;
    payment_id: number;
}

interface Booking {
   booking_id?: number;
    trip_id?: number;
    user_id?: number;
    seats_booked?: number;
    booking_date?: string;
    total_price?: number;
    booking_status?: string;
    booking_message?: string;
    passengers?: Passenger[];
    payment_status?:string;
    trip?:Trip;
    main_text_origen?:string;
    main_text_destination?:string;
    date_time?:string;
}


interface CuposProps {
    userId: number;
    token: string;
}

interface Trip {
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

interface TripDetailsProps {
    booking?:Booking;
    onClose: () => void;
}


const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';
const { MoreVertical } = Icons;

const TripDetails: React.FC<TripDetailsProps> = ({ booking,  onClose }) => {
    if(!booking) return null;
  return (
        <Card className={styles.detailsCard}>
                <Stack gap="xs">
                       <Group gap="apart">
                             <Text fw={600}>ID de la reserva:</Text>
                                   <Text>{booking.booking_id}</Text>
                         </Group>
                        <Group gap="apart">
                            <Text fw={600}>Origen:</Text>
                            <Text>{booking.trip?.main_text_origen}</Text>
                        </Group>
                        <Group gap="apart">
                            <Text fw={600}>Destino:</Text>
                            <Text>{booking.trip?.main_text_destination}</Text>
                         </Group>
                           <Group gap="apart">
                             <Text fw={600}>Fecha y Hora:</Text>
                             <Text>{dayjs(booking.date_time).format('DD/MM/YYYY HH:mm')}</Text>
                            </Group>
                    {booking.passengers && booking.passengers.length > 0 && (
                        <Card mt="md">
                            <Title order={5} className={styles.passengerTitle}>Pasajeros:</Title>
                                <List type="ordered">
                                      {booking.passengers.map((passenger) => (
                                          <List.Item key={passenger.passenger_id}>
                                                <Stack>
                                                     <Text>
                                                          Nombre: {passenger.full_name}
                                                       </Text>
                                                      <Text>
                                                             Identificación: {passenger.identification_number}
                                                       </Text>
                                                 </Stack>
                                         </List.Item>
                                     ))}
                                 </List>
                            </Card>
                       )}
                         <Button onClick={onClose} mt="md" size='xs'>Cerrar Detalles</Button>
                </Stack>
            </Card>
      );
};


const Cupos: React.FC<CuposProps> = ({ userId, token }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);


   const fetchTripData = async (tripId:number, token:string):Promise<Trip | null> => {
         try{
               const tripResponse = await fetch(
                     `${BASE_URL}/trips/${tripId}`,
                    {
                       headers: { 'x-token': token },
                   }
                );

                 if(tripResponse.ok){
                    const tripData = await tripResponse.json();
                    return tripData.data as Trip;
                 }else {
                       console.log('Error fetching trip:', tripId);
                    return null
                   }
            }catch(error){
                    console.log('Error fetching trip:', tripId, error);
               return null
            }

     };

    const fetchBookingData = async (userId: number, token: string): Promise<Booking[]> => {
        try {
            const response = await fetch(`${BASE_URL}/bookings/userid/${userId}`, {
                headers: { 'x-token': token },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching bookings:', errorData);
                showNotification({
                    title: 'Error al obtener las reservas',
                    message: `Hubo un error al cargar las reservas desde el servidor. Detalle: ${errorData.msj || 'Desconocido'}`,
                    color: 'red',
                });
                 return [];
             }

            const responseData = await response.json();
             if (!responseData.data || !Array.isArray(responseData.data)) {
                console.error('Invalid response from API: data array not found', responseData);
                showNotification({
                    title: 'Error al obtener las reservas',
                    message: 'La respuesta del servidor no tiene el formato esperado.',
                    color: 'red',
                });
                return [];
            }

            const bookingsData = responseData.data;
            console.log("bookings data: ", bookingsData)
              return bookingsData;

        } catch (error) {
             console.error('Error fetching bookings:', error);
           showNotification({
                title: 'Error al obtener las reservas',
                message:
                    'Hubo un error al cargar las reservas desde el servidor. Intenta de nuevo más tarde.',
                color: 'red',
            });
            return [];
        }
    };

    const fetchPaymentAndPassengerData = async (booking: any, token: string) : Promise<Booking>=> {
        try{
              const paymentsResponse = await fetch(
                   `${BASE_URL}/payments/bookingid/${booking.booking_id}`,
                   {
                       headers: { 'x-token': token },
                   }
               );
             if(paymentsResponse.ok){
               const paymentData = await paymentsResponse.json();
                 if (paymentData.data && paymentData.data.length > 0 ) {
                      const paymentStatus = paymentData.data[0].payment_status;
                      console.log('Status of payment for booking:', paymentData.data);
                        const passengersResponse = await fetch(
                           `${BASE_URL}/passengers/bookingid/${booking.booking_id}`,
                            {
                               headers: { 'x-token': token },
                          }
                        );
                         if(passengersResponse.ok){
                            const passengersData = await passengersResponse.json();
                             const trip = await fetchTripData(booking.trip_id, token);
                              return {
                                ...booking,
                                passengers: passengersData.data || [],
                                payment_status: paymentStatus,
                                trip:trip
                               };
                          }else {
                             console.log('Error fetching passengers for booking:', booking.booking_id);
                              return {
                                  ...booking,
                                  payment_status: paymentStatus
                             };
                        }
                   } else {
                       console.log('Error fetching payments for booking:', booking.booking_id);
                        return { ...booking,  payment_status: 'pending' };
                   }
              } else {
                   console.log('Error fetching payments for booking:', booking.booking_id);
                  return { ...booking, payment_status: 'pending'};
            }
       }  catch(error){
           console.error("error fetching data", error)
            return { ...booking, passengers: [], payment_status: 'pending' };
        }
     }

    const handleDetailsOpen = (bookingId: number) => {
       setSelectedBooking(bookingId);
       setIsDetailsOpen(true);
     };

     const handleDetailsClose = () => {
        setSelectedBooking(null);
        setIsDetailsOpen(false);
     };

     useEffect(() => {
       const fetchAndProcessBookings = async () => {
            setLoading(true);
            try {
                const bookingsData = await fetchBookingData(userId, token);
                const bookingsWithDetails = await Promise.all(
                   bookingsData.map(async (booking: any) => {
                      return  await fetchPaymentAndPassengerData(booking, token)
                  })
                 );

                const completedBookings = bookingsWithDetails.filter(booking => booking.payment_status === 'completed' && booking.trip);
                 setBookings(completedBookings);

                setLoading(false);
            } catch (error) {
                console.error('Error processing bookings:', error);
               setLoading(false);
           }
        };
         fetchAndProcessBookings();
     }, [userId, token]);

    if (loading) {
       return (
            <Container className={styles.container}>
                <LoadingOverlay visible />
                <Title className={styles.title}>Mis Cupos</Title>
                <Text className={styles.noTripsText}>Cargando tus cupos...</Text>
            </Container>
        );
    }
   return (
     <Container className={styles.container}>
            <Title className={styles.title}>Mis Cupos Comprados</Title>
            {bookings.length === 0 ? (
                <Text className={styles.noTripsText}>Aún no has comprado ningún cupo.</Text>
            ) : (
                <Stack gap="xl">
                   {bookings.map((booking) => (
                        <Card key={booking.booking_id} className={styles.cupoCard}>
                            <Stack gap="xs">
                                <Group gap="apart">
                                   <Text fw={600}>Origen:</Text>
                                     <Text>{booking.trip?.main_text_origen}</Text>
                                </Group>
                                <Group gap="apart">
                                   <Text fw={600}>Destino:</Text>
                                       <Text>{booking.trip?.main_text_destination}</Text>
                                </Group>
                                <Group gap="apart">
                                    <Text fw={600}>Fecha de reserva:</Text>
                                     <Text>{dayjs(booking.booking_date).format('DD/MM/YYYY HH:mm')}</Text>
                                 </Group>
                                <Group gap="apart">
                                    <Text fw={600}>Precio Total:</Text>
                                    <Text>${booking.total_price?.toLocaleString()}</Text>
                                </Group>
                              <Group align='flex-end'>
                                    <Menu shadow="md" withArrow position="bottom-end">
                                       <Menu.Target>
                                          <Button variant="outline" color='gray' size='xs'>
                                            <MoreVertical size={20} />
                                          </Button>
                                         </Menu.Target>
                                        <Transition transition="slide-down" duration={100} timingFunction="ease" mounted={isDetailsOpen}>
                                            {()=>(
                                                  <Menu.Dropdown>
                                                    <Menu.Item onClick={() => booking.booking_id && handleDetailsOpen(booking.booking_id)}>
                                                          Ver Detalles
                                                   </Menu.Item>
                                                 </Menu.Dropdown>
                                               )}

                                           </Transition>
                                       </Menu>
                              </Group>
                           </Stack>

                            {selectedBooking === booking.booking_id && isDetailsOpen && (
                                   <TripDetails
                                        booking={bookings.find(b => b.booking_id === selectedBooking)}
                                        onClose={handleDetailsClose}
                                    />
                             )}

                         </Card>
                    ))}
                </Stack>
            )}

         </Container>
    );
};

export default Cupos;
export const Route = createFileRoute('/Cupos/')({
  component: Cupos,
});
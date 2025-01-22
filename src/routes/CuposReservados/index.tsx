import React, { useState, useEffect } from 'react';
import { Text, LoadingOverlay, Table, ScrollArea, Badge, Button , Center } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import styles from './index.module.css';
import { createFileRoute } from '@tanstack/react-router';
import { BookedPassenger } from '../../components/Cupos/types';
interface CuposReservadosProps {
    tripId: number;
    token: string;
    userId: number;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const CuposReservadosComponent: React.FC<CuposReservadosProps> = ({ tripId, token, userId }) => {
    const [allPassengers, setAllPassengers] = useState<BookedPassenger[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredPassengers, setFilteredPassengers] = useState<BookedPassenger[]>([]);

    useEffect(() => {
        const fetchPassengers = async () => {
             try {
                 setLoading(true);
                  const url = `${BASE_URL}/passengers/userid_trip_det/${userId}`;
                  console.log('URL de la solicitud:', url);
                  const response = await fetch(
                        url,
                    {
                        headers: { 
                            'x-token': token,
                            'Content-Type': 'application/json', 
                        },
                    },
                  );

                  console.log('Respuesta del servidor:', response);

                   if (!response.ok) {
                         const errorData = await response.json();
                        console.error('Error fetching passengers:', errorData);
                         showNotification({
                            title: 'Error al obtener los pasajeros',
                            message:
                                `Hubo un error al cargar los pasajeros desde el servidor. Detalle: ${errorData.msj || 'Desconocido'}`,
                            color: 'red',
                        });
                         setLoading(false);
                        return;
                    }

                const responseData = await response.json();
                    if (!responseData.ok || !responseData.data) {
                        showNotification({
                            title: 'Error al obtener los pasajeros',
                            message:
                                'La respuesta del servidor no tiene el formato esperado.',
                            color: 'red',
                        });
                         setLoading(false);
                        return;
                  }
                
                setAllPassengers(responseData.data);
                 setLoading(false);
           } catch (error) {
                 console.error('Error fetching passengers:', error);
                showNotification({
                     title: 'Error al obtener los pasajeros',
                     message:
                        'Hubo un error al cargar los pasajeros desde el servidor. Intenta de nuevo más tarde.',
                     color: 'red',
                 });
                 setLoading(false);
             }
        };

        fetchPassengers();
    }, [userId, token]);

    useEffect(() => {
      // Filtrar los pasajeros por tripId
       const filtered = allPassengers.filter((passenger) => passenger.trip_id === tripId);
       setFilteredPassengers(filtered);
    }, [allPassengers, tripId]);
    if (loading) {
        return <LoadingOverlay visible />;
    }

    if (!filteredPassengers || filteredPassengers.length === 0) {
         return (
             <Center>
                <Text className={styles.noPassengersText}>No hay pasajeros comprados para este viaje.</Text>;
            </Center>
        )
    }

    const rows = filteredPassengers.map((passenger) => (
        <tr key={passenger.passenger_id} >
             <td  className={styles.cell} >{passenger.full_name}</td>
             <td className={styles.cell} >{passenger.identification_number}</td>
              <td className={styles.cell}>
                <Badge color={passenger.payment_status === 'completed' ? 'green' : 'red'}>
                    {passenger.payment_status === 'completed' ? 'Pagado' : 'Pendiente'}
                </Badge>
            </td>
            <td className={styles.cell}>
                <Button size="xs" variant="outline" color="blue" className={styles.validateButton} >
                   Validar Cupo
                </Button>
            </td>
        </tr>
    ));

    return (
        <ScrollArea>
            <Table verticalSpacing="sm" highlightOnHover  >
                <thead >
                    <tr >
                         <th className={styles.header}>Nombre</th>
                         <th className={styles.header}>Identificación</th>
                         <th className={styles.header}>Estado de Pago</th>
                         <th className={styles.header}>Acciones</th>
                    </tr>
                </thead>
               <tbody >{rows}</tbody>
            </Table>
        </ScrollArea>
    );
};
export const Route = createFileRoute('/CuposReservados/')({
  component: CuposReservadosComponent,
});

export default CuposReservadosComponent;
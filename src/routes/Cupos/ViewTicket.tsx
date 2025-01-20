import React, { useEffect, useState } from 'react';
import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router';
import {
    Container,
    Card,
    Stack,
    Text,
    Title,
    Button,
    Center
} from '@mantine/core';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, AlertCircle } from 'lucide-react';
import styles from './ViewTicket.module.css';
import html2canvas from 'html2canvas';
import { Booking, Passenger } from '../../components/Cupos/types';

interface PassengerData {
    passenger_id: number;
    full_name: string;
    identification_number: string;
    booking_qr: string;
    payment_id: number;
}
interface LocationState {
    booking?: Booking;
    passenger?: Passenger;
    selectedBooking?:Booking;
    showPassengers?: boolean
}

const ViewTicket = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [parsedPassenger, setParsedPassenger] = useState<PassengerData | null>(null);
    
    useEffect(() => {
        const booking = (location.state as LocationState)?.booking;
        const passenger = (location.state as LocationState)?.passenger;
   
        if (!booking || !passenger) {
            navigate({ to: '/reservar' });
            return;
        }

        try {
            setParsedPassenger(passenger);
        } catch (error) {
            console.error('ViewTicket: Error parsing passenger data:', error);
             navigate({ to: '/reservar' });
        }
    }, [navigate, location.state]);


    const handleDownload = async () => {
        if (!parsedPassenger) return;
        const ticketElement = document.getElementById(`ticket-${parsedPassenger.passenger_id}`);
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
            link.download = `ticket-${parsedPassenger.full_name}-${parsedPassenger.passenger_id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating the ticket:', error);
        }
    };

    if (!parsedPassenger) {
        return (
            <Container className={styles.ticketContainer}>
                <Card className={styles.ticketCard}>
                    <Stack align="center" gap="md">
                        <AlertCircle size={48} color="#ff6b6b" />
                        <Text ta="center" size="lg" c="white">
                            No se encontró información del tiquete
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
        <Container className={styles.ticketContainer}>
           <Card className={styles.ticketCard}>
               <div id={`ticket-${parsedPassenger.passenger_id}`} className={styles.ticketWrapper} style={{ position: 'relative', overflow: 'hidden' }}>
                 <div className={styles.ticketHeader}>
                     <div className={styles.ticketLogo}>
                         <img src="/Logo.png" alt="CompaCar" className={styles.logo} />
                     </div>
                      <Title order={3} className={styles.ticketTitle}>Tu tiquete en Cupo</Title>
                 </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom:'15px', position: 'relative', zIndex:1 }}>
                    <Text size="md"  c="#34D399" fw={700} style={{ marginBottom: '10px', display: 'block', textAlign:'center' }}>
                       Viaja seguro con Cupo
                     </Text>
                     <div style={{ display: 'block', textAlign:'center', padding:'10px', borderRadius:'8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', border: '1px solid #eee'}}>
                           <QRCodeCanvas
                                 value={parsedPassenger.booking_qr || ""}
                                 size={250}
                                 level="L"
                                 includeMargin={true}
                            />
                      </div>
                   </div>
                  <Center>
                      <Text size="lg" mt="md" fw={600} style={{color:"#333"}}>
                          {parsedPassenger.full_name}
                      </Text>
                        <Text size="md" mt="xs" fw={500} style={{color:"#555"}}>
                            {parsedPassenger.identification_number}
                        </Text>
                    </Center>
                  <div style={{marginTop:'20px',  marginBottom: '10px', textAlign: 'center' }}>
                     <Text size="xs" c="dimmed" style={{display:'block', padding: '5px 10px', verticalAlign:'middle'}}>
                          Términos y Condiciones
                      </Text>
                   </div>
               </div>
               <Button
                variant="light"
                  leftSection={<Download size={16} />}
                   onClick={handleDownload}
                   fullWidth
                   className={styles.downloadButton}
                   mt="md"
               >
                 Descargar Tiquete
               </Button>
           </Card>
       </Container>
    );
};

// Definimos la ruta de manera simple
export const Route = createFileRoute('/Cupos/ViewTicket')({
    component: ViewTicket
});

export default ViewTicket;
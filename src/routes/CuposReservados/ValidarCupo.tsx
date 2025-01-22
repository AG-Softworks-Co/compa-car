import React, { useState, useRef, useCallback } from 'react';
import { Container, Text, LoadingOverlay, Center, Button, Title, Paper, Stack, Alert } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { IconAlertCircle, IconCheck, IconQrcode } from '@tabler/icons-react';
import styles from './ValidarCupo.module.css';

interface ValidateResponse {
  ok: boolean;
  msg?: string;
  data?: any;
}

const ValidarCupoComponent = () => {
    const params = useParams<{
        passengerId: string;
        token: string;
        userId: string;
    }>();
    const { passengerId, token, userId } = params;

    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const qrRef = useRef<HTMLDivElement>(null);

    const handleValidate = useCallback(async () => {
        if (!scanResult) {
            showNotification({
                title: 'Error',
                message: 'Por favor escanee un código QR primero.',
                color: 'red',
                icon: <IconAlertCircle size={16} />,
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `https://rest-sorella-production.up.railway.app/api/passengers/${passengerId}`,
                {
                    method: 'PUT',
                    headers: {
                        'x-token': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'VALIDATED',
                        booking_qr: scanResult,
                    }),
                }
            );

            const data: ValidateResponse = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.msg || 'Error al validar el cupo');
            }

            setSuccess(true);
            showNotification({
                title: 'Validación Exitosa',
                message: 'El cupo ha sido validado correctamente',
                color: 'green',
                icon: <IconCheck size={16} />,
            });

            // Redirigir después de un breve delay para mostrar el mensaje de éxito
            setTimeout(() => {
                navigate({ to: '/Actividades' });
            }, 1500);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al validar el cupo';
            setError(errorMessage);
            showNotification({
                title: 'Error de Validación',
                message: errorMessage,
                color: 'red',
                icon: <IconAlertCircle size={16} />,
            });
        } finally {
            setLoading(false);
        }
    }, [scanResult, passengerId, token, navigate]);

    const handleScan = useCallback(() => {
        if (!qrRef.current) return;

        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) {
            setError('No se pudo encontrar el elemento canvas');
            return;
        }

        try {
            const context = canvas.getContext('2d');
            if (!context) {
                setError('No se pudo obtener el contexto del canvas');
                return;
            }

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                setScanResult(code.data);
                setError(null);
                showNotification({
                    title: 'QR Escaneado',
                    message: 'Código QR leído correctamente',
                    color: 'blue',
                    icon: <IconQrcode size={16} />,
                });
            } else {
                setError('No se pudo detectar un código QR válido');
            }
        } catch (err) {
            setError('Error al escanear el código QR');
            console.error('Error scanning QR:', err);
        }
    }, []);

    return (
        <Container size="sm" className={styles.container}>
            <LoadingOverlay visible={loading}  />
            
            <Title order={2} ta="center" mb="xl" className={styles.title}>
                Validar Cupo de Pasajero
            </Title>

            <Paper shadow="sm" radius="md" p="xl" className={styles.paper}>
                <Stack gap="lg">
                    <Center>
                        <div ref={qrRef} className={styles.qrContainer}>
                            <QRCodeSVG 
                                value={`${passengerId}+${userId}+${token}`}
                                size={256}
                                level="H"
                                includeMargin={true}
                                className={styles.qrCode}
                            />
                        </div>
                    </Center>

                    {error && (
                        <Alert 
                            icon={<IconAlertCircle size={16} />} 
                            title="Error" 
                            color="red" 
                            variant="filled"
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert 
                            icon={<IconCheck size={16} />} 
                            title="¡Éxito!" 
                            color="green" 
                            variant="filled"
                        >
                            Cupo validado correctamente
                        </Alert>
                    )}

                    {scanResult && (
                        <Text 
                            ta="center" 
                            size="sm" 
                            color="dimmed" 
                            className={styles.scanResult}
                        >
                            Código escaneado: {scanResult}
                        </Text>
                    )}

                    <Button 
                        variant="outline" 
                        color="blue" 
                        onClick={handleScan}
                        fullWidth
                        leftSection={<IconQrcode size={18} />}
                        className={styles.scanButton}
                    >
                        Escanear QR
                    </Button>

                    <Button
                        variant="filled"
                        color="green"
                        onClick={handleValidate}
                        fullWidth
                        disabled={!scanResult || loading}
                        className={styles.validateButton}
                    >
                        Validar Cupo
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
};

export const Route = createFileRoute('/CuposReservados/ValidarCupo')({
    component: ValidarCupoComponent,
});

export default ValidarCupoComponent;
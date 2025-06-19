import { useState, useCallback, useEffect } from 'react'
import {
  Container,
  Text,
  LoadingOverlay,
  Center,
  Title,
  Paper,
  Stack,
  Alert,
  Group,
  Modal,
  ActionIcon,
  Button,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { IconAlertCircle, IconCheck, IconQrcode, IconX } from '@tabler/icons-react'
import { supabase } from '@/lib/supabaseClient'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import styles from './ValidarCupo.module.css'
import { Capacitor } from '@capacitor/core'

const ValidarCupoComponent = () => {
  const params = Route.useParams() as { bookingId: string }
  const bookingId = Number(params.bookingId)

  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error' | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const navigate = useNavigate()

  // Validar el QR contra la base de datos
  const validateQR = useCallback(async (qrData: string) => {
    setLoading(true)
    try {
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('id, booking_qr, booking_status')
        .eq('id', bookingId)
        .single()

      if (fetchError || !booking) {
        throw new Error('No se encontró el booking.')
      }

      if (booking.booking_status === 'payed') {
        setModalType('error')
        setError('Este cupo ya fue validado anteriormente.')
        setIsModalOpen(true)
        return
      }

      if (booking.booking_qr !== qrData) {
        setModalType('error')
        setIsModalOpen(true)
        return
      }

      await supabase
        .from('booking_passengers')
        .update({ status: 'validated' })
        .eq('booking_id', bookingId)

      await supabase
        .from('bookings')
        .update({ booking_status: 'payed' })
        .eq('id', bookingId)

      setModalType('success')
      setIsModalOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al validar el cupo'
      setError(msg)
      setModalType('error')
      setIsModalOpen(true)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  // Botón para depurar permisos de cámara
  const debugCameraPermission = async () => {
    const status = await BarcodeScanner.checkPermission();
    alert(JSON.stringify(status, null, 2));
  };

  // Iniciar escaneo de QR
  const startQRScan = useCallback(async () => {
    if (Capacitor.getPlatform() === 'web') {
      // Fallback para web: pedir QR manualmente
      const qrData = prompt('Pega el código QR aquí:');
      if (qrData) {
        setScanResult(qrData);
        await validateQR(qrData);
      }
      return;
    }
    try {
      setIsScanning(true);
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        setError('Permiso de cámara denegado.');
        setModalType('error');
        setIsModalOpen(true);
        setIsScanning(false);
        return;
      }
      BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');
      document.getElementById('root')?.classList.add('scanner-active');
      // Oculta todo el contenido de la app mientras escaneas
      setTimeout(async () => {
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          const qrData = result.content;
          setScanResult(qrData);
          showNotification({
            title: 'QR Escaneado',
            message: `Código detectado: ${qrData}`,
            color: 'blue',
            icon: <IconQrcode size={16} />,
          });
          await validateQR(qrData);
        }
        setIsScanning(false);
        document.body.classList.remove('scanner-active');
        document.getElementById('root')?.classList.remove('scanner-active');
        await BarcodeScanner.stopScan();
      }, 300); // pequeño delay para asegurar que el DOM se actualiza
    } catch (err) {
      console.error(err);
      setError('Error al escanear el código QR.');
      setModalType('error');
      setIsModalOpen(true);
      setIsScanning(false);
      document.body.classList.remove('scanner-active');
      document.getElementById('root')?.classList.remove('scanner-active');
      await BarcodeScanner.stopScan();
    }
  }, [validateQR]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      try {
        BarcodeScanner.stopScan()
      } catch (e) {}
      document.body.classList.remove('scanner-active');
      document.getElementById('root')?.classList.remove('scanner-active');
    }
  }, [])

  // Cerrar modal y limpiar overlays
  const handleCloseModal = async () => {
    setIsModalOpen(false)
    try {
      await BarcodeScanner.stopScan()
    } catch (e) {}
    document.body.classList.remove('scanner-active')
    document.getElementById('root')?.classList.remove('scanner-active')
    navigate({ to: '/Actividades' })
  }

  return (
    <Container size="sm" className={styles.container}>
      <LoadingOverlay visible={loading && !isScanning} />
      <Group justify="space-between" mb="sm">
        <Title order={2} className={styles.title}>
          Validar Cupo
        </Title>
        <ActionIcon variant="light" onClick={handleCloseModal}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Text ta="center" size="sm" color="dimmed" mb="md">
        Escanea el código QR del tiquete. Esto confirma la llegada del pasajero y activa el pago, descontando la comisión de la plataforma Cupo.
      </Text>

      {/* OCULTA TODO EL CONTENIDO CUANDO SE ESCANEA */}
      {!isScanning && (
        <Paper shadow="sm" radius="md" p="xl" className={styles.paper}>
          <Stack gap="lg">
            <Group justify="center" className={styles.qrScannerContainer}>
              <Button
                onClick={startQRScan}
                size="lg"
                leftSection={<IconQrcode size={18} />}
                loading={isScanning}
                disabled={isScanning}
              >
                Escanear QR
              </Button>
              <Button onClick={debugCameraPermission} variant="outline" color="gray">
                Debug Permiso Cámara
              </Button>
            </Group>

            {scanResult && (
              <Text ta="center" size="sm" className={styles.scanResult}>
                Código detectado: {scanResult}
              </Text>
            )}

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="filled">
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>
      )}

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        centered
        title={modalType === 'success' ? 'Pasajero Verificado' : 'QR Incorrecto'}
      >
        <Stack>
          <Center>
            {modalType === 'success' ? (
              <IconCheck size={40} color="green" />
            ) : (
              <IconAlertCircle size={40} color="red" />
            )}
          </Center>
          <Text ta="center" size="lg" fw={500}>
            {modalType === 'success'
              ? 'El pasajero fue validado correctamente.'
              : 'El código QR no corresponde a este viaje.'}
          </Text>
          <Text ta="center" size="xs" color="dimmed">
            {modalType === 'success'
              ? 'Se ha registrado la llegada y se activó el proceso de pago con comisión incluida.'
              : 'Verifica que el pasajero tenga el tiquete correcto.'}
          </Text>
          <Button fullWidth mt="sm" onClick={handleCloseModal}>
            Volver a viajes
          </Button>
        </Stack>
      </Modal>
    </Container>
  )
}

export const Route = createFileRoute('/CuposReservados/ValidarCupo/$bookingId')({
  component: ValidarCupoComponent,
})

export default ValidarCupoComponent
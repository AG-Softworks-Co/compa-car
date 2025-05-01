import { useState, useRef, useCallback, useEffect } from 'react'
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
import jsQR from 'jsqr'
import { IconAlertCircle, IconCheck, IconQrcode, IconX } from '@tabler/icons-react'
import { supabase } from '@/lib/supabaseClient'
import styles from './ValidarCupo.module.css'

const ValidarCupoComponent = () => {
  const params = Route.useParams() as { bookingId: string }
  const bookingId = Number(params.bookingId)

  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error' | null>(null)
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const tick = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const width = videoRef.current.videoWidth
      const height = videoRef.current.videoHeight
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(videoRef.current, 0, 0, width, height)
      const imageData = ctx?.getImageData(0, 0, width, height)
      const qrCode = imageData ? jsQR(imageData.data, width, height) : null
      if (qrCode && !scanResult) {
        const qr = qrCode.data
        setScanResult(qr)
        showNotification({
          title: 'QR Escaneado',
          message: `Código detectado: ${qr}`,
          color: 'blue',
          icon: <IconQrcode size={16} />,
        })
        validateQR(qr)
      }
    }
    if (!scanResult) requestAnimationFrame(tick)
  }, [scanResult, validateQR])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.play()
        requestAnimationFrame(tick)
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }, [tick])

  useEffect(() => {
    startCamera()
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [startCamera])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    navigate({ to: '/Actividades' })
  }

  return (
    <Container size="sm" className={styles.container}>
      <LoadingOverlay visible={loading} />
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

      <Paper shadow="sm" radius="md" p="xl" className={styles.paper}>
        <Stack gap="lg">
          <Group justify="center" className={styles.qrScannerContainer}>
            <video ref={videoRef} className={styles.video} />
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

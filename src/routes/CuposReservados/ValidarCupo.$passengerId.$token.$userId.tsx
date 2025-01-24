import  { useState, useRef, useCallback, useEffect } from 'react'
import {
  Container,
  Text,
  LoadingOverlay,
  Center,
  Button,
  Title,
  Paper,
  Stack,
  Alert,
  Group,
  Modal,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import jsQR from 'jsqr'
import {
  IconAlertCircle,
  IconCheck,
  IconQrcode,
} from '@tabler/icons-react'
import styles from './ValidarCupo.module.css'

interface ValidateResponse {
  ok: boolean
  msg?: string
  data?: any
}

const ValidarCupoComponent = () => {
  // Obtener los parámetros de la ruta actual sin pasar argumentos a useParams
  const { passengerId, token } = Route.useParams()

  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scannedName, setScannedName] = useState<string | null>(null) // Nuevo estado para el nombre escaneado
  const [isCupoValidado, setIsCupoValidado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // const handleGoBack = () => {
  //   navigate({ to: '/Actividades' })
  // }

  const handleValidate = useCallback(async () => {
    if (!scanResult) {
      showNotification({
        title: 'Error',
        message: 'Por favor escanee un código QR primero.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

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
        },
      )

      const data: ValidateResponse = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.msg || 'Error al validar el cupo')
      }

      setSuccess(true)
      setIsCupoValidado(true) // Establecer el estado de cupo validado
      setIsModalOpen(true)
      showNotification({
        title: 'Validación Exitosa',
        message: 'El cupo ha sido validado correctamente',
        color: 'green',
        icon: <IconCheck size={16} />,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al validar el cupo'
      setError(errorMessage)
      showNotification({
        title: 'Error de Validación',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
    } finally {
      setLoading(false)
    }
  }, [scanResult, passengerId, token, navigate])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true') // Requerido para Safari en iOS
        videoRef.current.play()
        requestAnimationFrame(tick)
      }
    } catch (err) {
      setError(
        'Error al acceder a la cámara. Por favor, asegúrate de dar los permisos necesarios.',
      )
      console.error('Error starting camera:', err)
    }
  }, [])

  const tick = useCallback(() => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const canvasElement = document.createElement('canvas')
      const canvas = canvasElement.getContext('2d')
      const width = videoRef.current.videoWidth
      const height = videoRef.current.videoHeight

      canvasElement.width = width
      canvasElement.height = height
      canvas?.drawImage(videoRef.current, 0, 0, width, height)

      const imageData = canvas?.getImageData(0, 0, width, height)
      const code = imageData
        ? jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })
        : null

      if (code) {
        const qrData = code.data
        const [name, qr] = qrData.split('+') // Dividir la cadena escaneada
        setScannedName(name) // Establecer el nombre escaneado
        setScanResult(qr) // Establecer el QR escaneado
        setError(null)
        showNotification({
          title: 'QR Escaneado',
          message: `Nombre: ${name}, QR: ${qr}`,
          color: 'blue',
          icon: <IconQrcode size={16} />,
        })
      }
    }

    if (!isCupoValidado) {
      requestAnimationFrame(tick)
    }
  }, [isCupoValidado])

  useEffect(() => {
    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()

        tracks.forEach((track) => {
          track.stop()
        })
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

      <Title order={2} ta="center" mb="xl" className={styles.title}>
        Validar Cupo de Pasajero
      </Title>

      <Paper shadow="sm" radius="md" p="xl" className={styles.paper}>
        <Stack gap="lg">
          <Group gap="center">
            <video ref={videoRef} className={styles.video} />
          </Group>

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

          {scannedName && (
            <Text
              ta="center"
              size="sm"
              color="dimmed"
              className={styles.scanResult}
            >
              Nombre escaneado: {scannedName}
            </Text>
          )}

          {scanResult && (
            <Text
              ta="center"
              size="sm"
              color="dimmed"
              className={styles.scanResult}
            >
              Código QR escaneado: {scanResult}
            </Text>
          )}
          <Button
            variant="filled"
            color="green"
            onClick={handleValidate}
            fullWidth
            disabled={!scanResult || loading || isCupoValidado} // Deshabilitar si no hay resultado, está cargando o ya está validado
            className={styles.validateButton}
          >
            {isCupoValidado ? 'Cupo Validado' : 'Validar Cupo'}
          </Button>
        </Stack>
      </Paper>
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title="Validación de Cupo"
        centered
      >
        <Stack>
          <Center>
            <IconCheck size={40} color="green" />
          </Center>
          <Text ta="center" size="lg" fw={500}>
            ¡Cupo Validado Exitosamente!
          </Text>
          <Text ta="center" size="sm" color="dimmed">
            El cupo del pasajero ha sido validado correctamente.
          </Text>
          <Button color="green" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Stack>
      </Modal>
    </Container>
  )
}

export const Route = createFileRoute(
  '/CuposReservados/ValidarCupo/$passengerId/$token/$userId',
)({
  component: ValidarCupoComponent,
})

export default ValidarCupoComponent

import type React from 'react'
import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Container,
  Title,
  Text,
  LoadingOverlay,
  Modal,
  Button,
} from '@mantine/core'
import {
  User,
  Ticket,
  HelpCircle,
  Car,
  LogOut,
  ChevronRight,
  CheckCircle,
  FileText,
  Shield,
  AlertCircle,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import styles from './index.module.css'

// Interfaces
interface UserProfile {
  id: number
  email: string
  phone_number: string
  first_name: string
  last_name: string
  identification_type: string
  identification_number: string
  user_type: string
}

interface VehicleStatus {
  hasVehicle: boolean
  hasLicense: boolean
  hasSoat: boolean
  hasPropertyCard: boolean
}

interface DocumentStatus {
  type: string
  title: string
  icon: React.ComponentType<LucideProps>
  status: 'pending' | 'complete' | 'required'
  path: string
  description?: string
}

interface MenuItem {
  id: string
  icon: React.ComponentType<LucideProps>
  title: string
  subtitle: string
  path?: string
  expandable?: boolean
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api'

const ProfileView: React.FC = () => {
  // Estados
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>({
    hasVehicle: false,
    hasLicense: false,
    hasSoat: false,
    hasPropertyCard: false,
  })
  const [error, setError] = useState('')
  const [showVehicleOptions, setShowVehicleOptions] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [showVehicleMessage, setShowVehicleMessage] = useState(false)
  // Definición de items del menú
  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: User,
      title: 'Mi perfil',
      subtitle: 'Información personal y preferencias',
      path: '/CompletarRegistro',
    },
    {
      id: 'vehicle',
      icon: Car,
      title: 'Mi vehículo',
      subtitle: 'Gestiona la información de tu vehículo',
      expandable: true,
    },
    {
      id: 'coupons',
      icon: Ticket,
      title: 'Cupones',
      subtitle: 'Descuentos y promociones disponibles',
      path: '/Cupones',
    },
    {
      id: 'support',
      icon: HelpCircle,
      title: 'Ayuda y soporte',
      subtitle: 'Centro de ayuda y contacto',
      path: '/Ayuda',
    },
  ]

  // Efecto para cargar datos del usuario y documentos
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const userId = localStorage.getItem('userId')

        if (!token || !userId) {
          console.log('No hay sesión activa, redirigiendo...')
          navigate({ to: '/Login' })
          return
        }

        // Cargar perfil de usuario
        console.log('Cargando datos del usuario...')
        const profileResponse = await fetch(`${BASE_URL}/users/${userId}`, {
          headers: { 'x-token': token },
        })

        if (!profileResponse.ok) {
          throw new Error('Error al cargar el perfil')
        }

        const profileData = await profileResponse.json()
        console.log('Datos del perfil recibidos:', profileData)

        if (profileData.ok && profileData.data) {
          setUserProfile(profileData.data)
        }

        // Cargar estado de la licencia
        console.log('Verificando datos de la licencia...')
        const licenseResponse = await fetch(`${BASE_URL}/driver_licenses`, {
          headers: { 'x-token': token },
        })

        if (!licenseResponse.ok) {
          console.error('Error al verificar la licencia:', licenseResponse)
          throw new Error('Error al verificar la licencia')
        }

        const licenseData = await licenseResponse.json()
        console.log('Datos de la licencia recibidos:', licenseData)

        const userLicense = licenseData.data?.find(
          (license: any) => license.user_id.toString() === userId,
        )

        // Cargar estado del vehículo
        console.log('Verificando documentos del vehículo...')
        const vehicleResponse = await fetch(`${BASE_URL}/vehicles`, {
          headers: { 'x-token': token },
        })

        if (!vehicleResponse.ok) {
          throw new Error('Error al verificar el vehículo')
        }

        const vehicleData = await vehicleResponse.json()
        console.log('Datos del vehículo recibidos:', vehicleData)

        const userVehicle = vehicleData.data?.find(
          (vehicle: any) => vehicle.user_id.toString() === userId,
        )

        // Cargar estado del SOAT
        console.log('Verificando datos del SOAT...')
        const soatResponse = await fetch(`${BASE_URL}/soat_details`, {
          headers: { 'x-token': token },
        })
        if (!soatResponse.ok) {
          console.error('Error al verificar el SOAT:', soatResponse)
          throw new Error('Error al verificar el SOAT')
        }

        const soatData = await soatResponse.json()
        console.log('Datos de SOAT recibidos:', soatData)

        const userSoat = soatData.data?.find(
          (soat: any) => soat.user_id.toString() === userId,
        )

        // Cargar estado de la Tarjeta de Propiedad
        console.log('Verificando datos de la Tarjeta de Propiedad...')
        const propertyCardResponse = await fetch(`${BASE_URL}/property_cards`, {
          headers: { 'x-token': token },
        })
        if (!propertyCardResponse.ok) {
          console.error(
            'Error al verificar la Tarjeta de Propiedad:',
            propertyCardResponse,
          )
          throw new Error('Error al verificar la Tarjeta de Propiedad')
        }

        const propertyCardData = await propertyCardResponse.json()
        console.log(
          'Datos de la Tarjeta de Propiedad recibidos:',
          propertyCardData,
        )
        const userPropertyCard = propertyCardData.data?.find(
          (card: any) => card.user_id.toString() === userId,
        )

        setVehicleStatus({
          hasVehicle: Boolean(userVehicle),
          hasLicense: Boolean(userLicense),
          hasSoat: Boolean(userSoat),
          hasPropertyCard: Boolean(userPropertyCard),
        })
      } catch (error) {
        console.error('Error en la carga de datos:', error)
        setError('Error al cargar la información')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  useEffect(() => {
    const checkDocumentCompletion = async () => {
      if (userProfile) {
        const allDocumentsComplete =
          vehicleStatus.hasVehicle &&
          vehicleStatus.hasLicense &&
          vehicleStatus.hasSoat &&
          vehicleStatus.hasPropertyCard

        if (userProfile.user_type !== 'DRIVER' && allDocumentsComplete) {
          try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const userId = localStorage.getItem('userId')

            if (!token || !userId) {
              console.error(
                'No hay token o userId disponible para cambiar el rol del usuario.',
              )
              return
            }
            const updateUrl = `${BASE_URL}/users/${userId}`
            const requestBody = {
              user_type: 'DRIVER',
            }

            console.log(
              'Actualizando user_type a DRIVER:',
              requestBody,
              'URL',
              updateUrl,
            )

            // Make the PUT request to update user_type to DRIVER
            const response = await fetch(updateUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-token': token,
              },
              body: JSON.stringify(requestBody),
            })
            console.log('Respuesta del server:', response)

            if (!response.ok) {
              const errorData = await response.json()
              console.error(
                'Error al actualizar el rol del usuario:',
                errorData,
              )
              throw new Error(
                `Error al actualizar el rol del usuario: ${response.status}`,
              )
            }

            const responseData = await response.json()
            console.log('Respuesta del cambio de rol:', responseData)

            // Update userProfile state with the new user_type
            if (responseData.ok && responseData.data) {
              setUserProfile((prevProfile) => ({
                ...(prevProfile as UserProfile),
                user_type: 'DRIVER',
              }))
            }

            setSuccessMessage(
              `Felicidades ${userProfile.first_name} ${userProfile.last_name} ya tienes las habilidades de conductor en cupo.`,
            )
            setIsSuccessModalOpen(true)
            console.log('Rol actualizado con éxito, mostrando modal.')
          } catch (error) {
            console.error('Error al actualizar el rol del usuario:', error)
            setError(`Error al actualizar el rol del usuario: ${error}`)
          } finally {
            setLoading(false)
          }
        } else if (!allDocumentsComplete) {
          setShowVehicleMessage(true)
        }
      }
    }

    checkDocumentCompletion()
  }, [vehicleStatus, userProfile])

  // Helpers y manejadores
  const handleLogout = () => {
    localStorage.clear()
    navigate({ to: '/' })
  }

  const handleNavigation = (path: string) => {
    console.log('Navegando a:', path)
    navigate({ to: path })
  }

  const toggleVehicleOptions = () => {
    setShowVehicleOptions(!showVehicleOptions)
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
  }

  const getDocumentsList = (): DocumentStatus[] => {
    return [
      {
        type: 'vehicle',
        title: 'Registro de Vehículo',
        icon: Car,
        status: vehicleStatus.hasVehicle ? 'complete' : 'required',
        path: '/RegistrarVehiculo',
        description: 'Información básica del vehículo',
      },
      {
        type: 'license',
        title: 'Licencia de Conducción',
        icon: FileText,
        status: vehicleStatus.hasLicense ? 'complete' : 'required',
        path: '/RegistrarVehiculo/License',
        description: 'Documento de conducción vigente',
      },
      {
        type: 'soat',
        title: 'SOAT',
        icon: Shield,
        status: vehicleStatus.hasSoat ? 'complete' : 'required',
        path: '/RegistrarVehiculo/Soat',
        description: 'Seguro obligatorio vigente',
      },
      {
        type: 'property',
        title: 'Tarjeta de Propiedad',
        icon: FileText,
        status: vehicleStatus.hasPropertyCard ? 'complete' : 'required',
        path: '/RegistrarVehiculo/PropertyCard',
        description: 'Documento de propiedad del vehículo',
      },
    ]
  }

  const renderVehicleSubmenu = () => (
    <div className={styles.subMenu}>
      {getDocumentsList().map((doc) => (
        <div
          key={doc.type}
          className={`${styles.subMenuItem} ${
            doc.status === 'complete' ? styles.completed : ''
          }`}
          onClick={() => handleNavigation(doc.path)}
        >
          <div className={styles.subMenuItemContent}>
            <div className={styles.subMenuItemIcon}>
              <doc.icon size={24} />
            </div>
            <div className={styles.subMenuItemDetails}>
              <Text className={styles.subMenuItemText}>{doc.title}</Text>
              {doc.description && (
                <Text className={styles.subMenuItemDescription}>
                  {doc.description}
                </Text>
              )}
            </div>
          </div>
          <div className={styles.subMenuItemStatus}>
            {doc.status === 'complete' ? (
              <CheckCircle size={16} className={styles.statusIconComplete} />
            ) : (
              <AlertCircle size={16} className={styles.statusIconRequired} />
            )}
            <Text className={styles.statusText}>
              {doc.status === 'complete' ? 'Completado' : 'Requerido'}
            </Text>
          </div>
        </div>
      ))}
      {/* Completion message */}
      {showVehicleMessage &&
        !vehicleStatus.hasVehicle &&
        !vehicleStatus.hasLicense &&
        !vehicleStatus.hasSoat &&
        !vehicleStatus.hasPropertyCard && (
          <div className={styles.vehicleIncompleteMessage}>
            <Text className={styles.vehicleIncompleteText}>
              Para ser conductor, debes completar todos los registros
            </Text>
          </div>
        )}
      {showVehicleMessage &&
        (vehicleStatus.hasVehicle ||
          vehicleStatus.hasLicense ||
          vehicleStatus.hasSoat ||
          vehicleStatus.hasPropertyCard) && (
          <div className={styles.vehicleIncompleteMessage}>
            <Text className={styles.vehicleIncompleteText}>
              Para ser conductor debes completar todos los registros del
              vehiculo
            </Text>
          </div>
        )}
      {vehicleStatus.hasVehicle &&
        vehicleStatus.hasLicense &&
        vehicleStatus.hasSoat &&
        vehicleStatus.hasPropertyCard && (
          <div className={styles.vehicleRegistrationComplete}>
            <Text className={styles.vehicleRegistrationText}>
              ¡Registro de vehículo completado!
            </Text>
            <Text className={styles.vehicleRegistrationSubtitle}>
              ¡Eres conductor en Cupo!
            </Text>
          </div>
        )}
    </div>
  )

  // Loading state
  if (loading) {
    return (
      <Container fluid className={styles.container}>
        <LoadingOverlay visible />
      </Container>
    )
  }

  // Render principal
  return (
    <Container fluid className={styles.container}>
      {/* Confirmation Modal */}
      <Modal
        opened={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        title="Éxito"
        classNames={{
          root: styles.modalContainer,
          title: styles.modalTitle,
          body: styles.modalBody,
          header: styles.modalHeader,
          close: styles.modalCloseButton,
        }}
      >
        <div className={styles.modalContent}>
          <CheckCircle size={60} color="green" className={styles.modalIcon} />
          <Text size="xl" fw={500} mt="md" className={styles.modalParagraph}>
            {successMessage}
          </Text>
          <Button
            onClick={handleSuccessModalClose}
            variant="filled"
            color="green"
            className={styles.buttonModalPrimary}
          >
            Aceptar
          </Button>
        </div>
      </Modal>
      <div className={styles.header}>
        <Title className={styles.title}>Menú</Title>
      </div>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          <User size={40} />
        </div>
        <div className={styles.userInfo}>
          <Text className={styles.userName}>
            {userProfile
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : 'Usuario'}
          </Text>
          <Text className={styles.userEmail}>{userProfile?.email}</Text>
          <Text
            className={`${styles.userType} ${userProfile?.user_type === 'DRIVER' ? styles.driver : ''}`}
          >
            {userProfile?.user_type === 'DRIVER' ? 'Conductor' : 'Pasajero'}
          </Text>
        </div>
      </div>

      <div className={styles.menuSection}>
        {menuItems.map((item) => (
          <div key={item.id}>
            <div
              className={`${styles.menuItem} ${
                item.expandable && showVehicleOptions ? styles.expanded : ''
              }`}
              onClick={() => {
                if (item.expandable) {
                  toggleVehicleOptions()
                } else if (item.path) {
                  handleNavigation(item.path)
                }
              }}
              data-type={item.id}
            >
              <div className={styles.menuItemIcon}>
                <item.icon size={24} />
              </div>
              <div className={styles.menuItemContent}>
                <Text className={styles.menuItemTitle}>{item.title}</Text>
                <Text className={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </div>
              <ChevronRight
                className={`${styles.menuItemArrow} ${
                  item.expandable && showVehicleOptions
                    ? styles.rotatedArrow
                    : ''
                }`}
                size={20}
              />
            </div>
            {item.expandable && showVehicleOptions && renderVehicleSubmenu()}
          </div>
        ))}

        <button
          className={`${styles.menuItem} ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          <div className={styles.menuItemIcon}>
            <LogOut size={24} />
          </div>
          <div className={styles.menuItemContent}>
            <Text className={styles.menuItemTitle}>Salir</Text>
            <Text className={styles.menuItemSubtitle}>Cerrar sesión</Text>
          </div>
          <ChevronRight className={styles.menuItemArrow} size={20} />
        </button>
      </div>

      {error && (
        <Text className={styles.errorMessage}>
          <AlertCircle size={16} style={{ marginRight: 8 }} />
          {error}
        </Text>
      )}

      <Text className={styles.version}>v2.55.8 (968)</Text>
    </Container>
  )
}

export const Route = createFileRoute('/Perfil/')({
  component: ProfileView,
})

export default ProfileView

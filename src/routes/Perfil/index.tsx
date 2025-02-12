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
  Wallet,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import styles from './index.module.css'
import { supabase } from '@/lib/supabaseClient'

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
  subMenuItems?: SubMenuItem[]
}

interface SubMenuItem {
  id: string
  title: string
  path: string
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
  const [showWalletOptions, setShowWalletOptions] = useState(false)

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
      id: 'wallet',
      icon: Wallet,
      title: 'Wallet Virtual',
      subtitle: 'Gestiona tu billetera virtual',
      expandable: true,
      subMenuItems: [
        {
          id: 'wallet-detail',
          title: 'Ver detalle de billetera',
          path: '/Wallet',
        },
        {
          id: 'wallet-reload',
          title: 'Recargar billetera',
          path: '/Gateway',
        },
      ],
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
        const userId = localStorage.getItem('userId')

        if (!userId) {
          console.log('No hay sesión activa, redirigiendo...')
          navigate({ to: '/Login' })
          return
        }

        // Cargar perfil de usuario y sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError) throw profileError
        if (sessionError) throw sessionError
        if (profileData) {
          setUserProfile({
            id: profileData.id,
            email: session?.user?.email || '',
            phone_number: profileData.phone_number || '',
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            identification_type: profileData.identification_type,
            identification_number: profileData.identification_number,
            user_type: profileData.status // Usando status como user_type
          })
        }

        // Cargar datos del vehículo y documentos
        const [
          { data: vehicleData },
          { data: licenseData },
          { data: soatData },
          { data: propertyCardData }
        ] = await Promise.all([
          supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userId)
            .single(),
          supabase
            .from('driver_licenses')
            .select('*')
            .eq('user_id', userId)
            .single(),
          supabase
            .from('soat_details')
            .select('*')
            .eq('user_id', userId)
            .single(),
          supabase
            .from('property_cards')
            .select('*')
            .eq('user_id', userId)
            .single()
        ])

        setVehicleStatus({
          hasVehicle: Boolean(vehicleData),
          hasLicense: Boolean(licenseData),
          hasSoat: Boolean(soatData),
          hasPropertyCard: Boolean(propertyCardData)
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
            const userId = localStorage.getItem('userId')

            if (!userId) {
              console.error('No hay userId disponible para cambiar el rol del usuario.')
              return
            }

            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ status: 'DRIVER' })
              .eq('user_id', userId)

            if (updateError) throw updateError

            setUserProfile(prev => ({
              ...(prev as UserProfile),
              user_type: 'DRIVER'
            }))

            setSuccessMessage(
              `Felicidades ${userProfile.first_name} ${userProfile.last_name} ya tienes las habilidades de conductor en cupo.`
            )
            setIsSuccessModalOpen(true)

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
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      localStorage.clear()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

   const handleNavigation = (path: string) => {
    console.log('Navegando a:', path)
    navigate({ to: path });
  };

  const toggleVehicleOptions = () => {
    setShowVehicleOptions(!showVehicleOptions)
  }

  const toggleWalletOptions = () => {
    setShowWalletOptions(!showWalletOptions)
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

  const renderWalletSubmenu = (subMenuItems: SubMenuItem[]) => {
    return (
      <div className={styles.subMenu}>
        {subMenuItems.map((subItem) => (
          <div
            key={subItem.id}
            className={styles.subMenuItem}
            onClick={() => handleNavigation(subItem.path)}
          >
            <div className={styles.subMenuItemContent}>
              <div className={styles.subMenuItemDetails}>
                <Text className={styles.subMenuItemText}>{subItem.title}</Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  

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
            className={`${styles.userType} ${
              userProfile?.user_type === 'DRIVER' ? styles.driver : ''
            }`}
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
                item.expandable &&
                  ((item.id === 'vehicle' && showVehicleOptions) ||
                    (item.id === 'wallet' && showWalletOptions))
                  ? styles.expanded
                  : ''
              }`}
              onClick={() => {
                if (item.expandable) {
                  if (item.id === 'vehicle') {
                    toggleVehicleOptions()
                  } else if (item.id === 'wallet') {
                    toggleWalletOptions();
                  }
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
                  item.expandable &&
                    ((item.id === 'vehicle' && showVehicleOptions) ||
                      (item.id === 'wallet' && showWalletOptions))
                    ? styles.rotatedArrow
                    : ''
                }`}
                size={20}
              />
            </div>
            {item.expandable && item.id === 'vehicle' && showVehicleOptions && renderVehicleSubmenu()}
            {item.expandable && item.id === 'wallet' && showWalletOptions &&
             item.subMenuItems && renderWalletSubmenu(item.subMenuItems)}
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
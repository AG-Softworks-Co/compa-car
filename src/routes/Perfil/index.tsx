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
  MessageCircle,
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
    {
      id: 'chats',
      icon: MessageCircle,
      title: 'Chats',
      subtitle: 'Conversaciones con conductores y pasajeros',
      path: '/Chat',
    }
    
  ]

  const checkAndUpdateUserRole = async (userId: string, hasAllDocs: boolean) => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (userProfile?.status === 'PASSENGER' && hasAllDocs) {
        // Actualizar a DRIVER
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ status: 'DRIVER' })
          .eq('user_id', userId);

        if (updateError) throw updateError;

        // Actualizar estado local
        setUserProfile(prev => prev ? {
          ...prev,
          user_type: 'DRIVER'
        } : null);

        // Mostrar notificación
        setSuccessMessage(
          `¡Felicitaciones! Has completado todos los documentos requeridos. Ahora eres conductor verificado.`
        );
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Efecto para cargar datos del usuario y documentos
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          navigate({ to: '/Login' });
          return;
        }

        // Cargar todos los documentos y perfil en paralelo
        const [
          { data: profile },
          { data: vehicle },
          { data: license },
          { data: soat },
          { data: propertyCard }
        ] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', session.user.id).single(),
          supabase.from('vehicles').select('id').eq('user_id', session.user.id).maybeSingle(),
          supabase.from('driver_licenses').select('id').eq('user_id', session.user.id).maybeSingle(),
          supabase.from('soat_details').select('id').eq('user_id', session.user.id).maybeSingle(),
          supabase.from('property_cards').select('id').eq('user_id', session.user.id).maybeSingle()
        ]);

        const hasAllDocuments = Boolean(vehicle && license && soat && propertyCard);
        
        // Verificar y actualizar rol si es necesario
        await checkAndUpdateUserRole(session.user.id, hasAllDocuments);

        // Actualizar estados
        if (profile) {
          setUserProfile({
            id: profile.id,
            email: session.user.email ?? '',
            phone_number: profile.phone_number ?? '',
            first_name: profile.first_name,
            last_name: profile.last_name,
            identification_type: profile.identification_type,
            identification_number: profile.identification_number,
            user_type: profile.status
          });
        }
        setVehicleStatus({
          hasVehicle: Boolean(vehicle),
          hasLicense: Boolean(license),
          hasSoat: Boolean(soat),
          hasPropertyCard: Boolean(propertyCard)
        });

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // Modificar la sección de renderizado del usuario
  const renderUserSection = () => (
    <div className={styles.userSection}>
      <div className={styles.userAvatar}>
        <User size={40} />
      </div>
      <div className={styles.userInfo}>
        <Text className={styles.userName}>
          {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuario'}
        </Text>
        <Text className={styles.userEmail}>{userProfile?.email}</Text>
        <Text
          className={`${styles.userType} ${
            userProfile?.user_type === 'DRIVER' ? styles.driver : ''
          }`}
        >
          {userProfile?.user_type === 'DRIVER' ? (
            <>
              <CheckCircle size={16} className={styles.verifiedIcon} />
              Conductor Verificado
            </>
          ) : (
            'Pasajero'
          )}
        </Text>
      </div>
    </div>
  );

  useEffect(() => {
    const checkDocumentCompletion = async () => {
      if (userProfile) {
        // Verificar que todos los documentos estén completos
        const allDocumentsComplete =
          vehicleStatus.hasVehicle &&
          vehicleStatus.hasLicense &&
          vehicleStatus.hasSoat &&
          vehicleStatus.hasPropertyCard;

        // Solo proceder si tiene todos los documentos y NO es conductor aún
        if (userProfile.user_type === 'PASSENGER' && allDocumentsComplete) {
          try {
            setLoading(true);
            const userId = localStorage.getItem('userId');

            if (!userId) {
              console.error('No hay userId disponible');
              return;
            }

            // Actualizar el rol a DRIVER
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ status: 'DRIVER' })
              .eq('user_id', userId);

            if (updateError) throw updateError;

            // Actualizar el estado local
            setUserProfile(prev => ({
              ...(prev as UserProfile),
              user_type: 'DRIVER'
            }));

            // Mostrar mensaje de felicitación
            setSuccessMessage(
              `¡Felicitaciones ${userProfile.first_name}! Ya eres conductor en Cupo. Ahora puedes publicar viajes.`
            );
            setIsSuccessModalOpen(true);

          } catch (error) {
            console.error('Error al actualizar el rol:', error);
            setError('Error al actualizar tu perfil de conductor');
          } finally {
            setLoading(false);
          }
        } else if (!allDocumentsComplete && userProfile.user_type === 'PASSENGER') {
          // Mostrar mensaje solo si aún es pasajero y le faltan documentos
          setShowVehicleMessage(true);
        }
      }
    };

    checkDocumentCompletion();
  }, [vehicleStatus, userProfile]);

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
      {/* Mensajes actualizados */}
      {showVehicleMessage && userProfile?.user_type === 'PASSENGER' && (
        <div className={styles.vehicleIncompleteMessage}>
          <Text className={styles.vehicleIncompleteText}>
            Para convertirte en conductor, completa todos los documentos requeridos
          </Text>
        </div>
      )}
      {userProfile?.user_type === 'DRIVER' && (
        <div className={styles.vehicleRegistrationComplete}>
          <Text className={styles.vehicleRegistrationText}>
            ¡Eres conductor verificado!
          </Text>
          <Text className={styles.vehicleRegistrationSubtitle}>
            Puedes publicar y gestionar viajes
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

      {renderUserSection()}

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
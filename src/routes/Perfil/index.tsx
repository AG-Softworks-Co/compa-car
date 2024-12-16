import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
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
} from 'lucide-react';
import { LucideProps } from 'lucide-react';
import styles from './index.module.css';

// Interfaces
interface UserProfile {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number: string;
  user_type: string;
}

interface VehicleStatus {
  hasVehicle: boolean;
  hasLicense: boolean;
  hasSoat: boolean;
  hasPropertyCard: boolean;
}

interface DocumentStatus {
  type: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  status: 'pending' | 'complete' | 'required';
  path: string;
  description?: string;
}

interface MenuItem {
  id: string;
  icon: React.ComponentType<LucideProps>;
  title: string;
  subtitle: string;
  path?: string;
  expandable?: boolean;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const ProfileView: React.FC = () => {
  // Estados
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>({
    hasVehicle: false,
    hasLicense: false,
    hasSoat: false,
    hasPropertyCard: false,
  });
  const [error, setError] = useState('');
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);

  // Definición de items del menú
  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: User,
      title: 'Mi perfil',
      subtitle: 'Información personal y preferencias',
      path: '/CompletarRegistro'
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
      path: '/Cupones'
    },
    {
      id: 'support',
      icon: HelpCircle,
      title: 'Ayuda y soporte',
      subtitle: 'Centro de ayuda y contacto',
      path: '/Ayuda'
    }
  ];

  // Efecto para cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          console.log('No hay sesión activa, redirigiendo...');
          navigate({ to: '/Login' });
          return;
        }

        // Cargar perfil de usuario
        console.log('Cargando datos del usuario...');
        const profileResponse = await fetch(`${BASE_URL}/users/${userId}`, {
          headers: { 'x-token': token },
        });

        if (!profileResponse.ok) {
          throw new Error('Error al cargar el perfil');
        }

        const profileData = await profileResponse.json();
        console.log('Datos del perfil recibidos:', profileData);

        if (profileData.ok && profileData.data) {
          setUserProfile(profileData.data);
        }

        // Cargar estado del vehículo
        console.log('Verificando documentos del vehículo...');
        const vehicleResponse = await fetch(`${BASE_URL}/vehicles`, {
          headers: { 'x-token': token },
        });

        if (!vehicleResponse.ok) {
          throw new Error('Error al verificar el vehículo');
        }

        const vehicleData = await vehicleResponse.json();
        console.log('Datos del vehículo recibidos:', vehicleData);

        const userVehicle = vehicleData.data?.find(
          (vehicle: any) => vehicle.user_id.toString() === userId
        );

        setVehicleStatus({
          hasVehicle: Boolean(userVehicle),
          hasLicense: Boolean(userVehicle?.license_url),
          hasSoat: Boolean(userVehicle?.soat_url),
          hasPropertyCard: Boolean(userVehicle?.property_card_url),
        });

      } catch (error) {
        console.error('Error en la carga de datos:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  // Helpers y manejadores
  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: '/' });
  };

  const handleNavigation = (path: string) => {
    console.log('Navegando a:', path);
    navigate({ to: path });
  };

  const toggleVehicleOptions = () => {
    setShowVehicleOptions(!showVehicleOptions);
  };

  const getDocumentsList = (): DocumentStatus[] => [
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
  ];

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
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <Container fluid className={styles.container}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  // Render principal
  return (
    <Container fluid className={styles.container}>
      <div className={styles.header}>
        <Title className={styles.title}>Menú</Title>
      </div>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          <User size={40} />
        </div>
        <div className={styles.userInfo}>
          <Text className={styles.userName}>
            {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuario'}
          </Text>
          <Text className={styles.userEmail}>{userProfile?.email}</Text>
          <Text className={styles.userType}>
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
                  toggleVehicleOptions();
                } else if (item.path) {
                  handleNavigation(item.path);
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
                  item.expandable && showVehicleOptions ? styles.rotatedArrow : ''
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
  );
};

export const Route = createFileRoute('/perfil/')({
  component: ProfileView,
});

export default ProfileView;
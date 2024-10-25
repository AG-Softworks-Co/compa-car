import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Container, Title, Text } from '@mantine/core';
import { 
  User, 
  Ticket, 
  HelpCircle, 
  Car,
  LogOut,
  ChevronRight 
} from 'lucide-react';
import styles from './index.module.css';

const menuItems = [
  {
    icon: User,
    title: 'Mi perfil',
    subtitle: 'Información personal y preferencias',
    to: '/profile/details'
  },
  {
    icon: Car,
    title: 'Mi vehículo',
    subtitle: 'Gestiona la información de tu vehículo',
    to: '/profile/vehicle'
  },
  {
    icon: Ticket,
    title: 'Cupones',
    subtitle: 'Descuentos y promociones disponibles',
    to: '/profile/coupons'
  },
  {
    icon: HelpCircle,
    title: 'Ayuda y soporte',
    subtitle: 'Centro de ayuda y contacto',
    to: '/profile/help'
  }
];

const ProfileView = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de logout aquí
    console.log('Cerrando sesión...');
    navigate({ to: '/' });
  };

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
          <Text className={styles.userName}>Nombre Usuario</Text>
          <Text className={styles.userEmail}>usuario@email.com</Text>
        </div>
      </div>

      <div className={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className={styles.menuItem}
          >
            <div className={styles.menuItemIcon}>
              <item.icon size={24} />
            </div>
            <div className={styles.menuItemContent}>
              <Text className={styles.menuItemTitle}>{item.title}</Text>
              <Text className={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </div>
            <ChevronRight className={styles.menuItemArrow} size={20} />
          </Link>
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

      <Text className={styles.version}>v2.55.8 (968)</Text>
    </Container>
  );
};

export const Route = createFileRoute('/perfil/')({
  component: ProfileView
});
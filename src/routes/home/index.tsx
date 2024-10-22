import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Button,
  Box,
  Group,
  Card,
} from '@mantine/core';
import { 
  Car, 
  ArrowRight, 
  Users, 
  Shield, 
  Star, 
  MapPin, 
  Clock, 
  BadgeCheck 
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CardsCarousel } from '../../components/ui/home/features';
import { FeatureCarousel } from '../../components/ui/home/FeatureCarousel';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './home.module.css';

// Componente para los números animados
const AnimatedStat = ({ value, label }: { value: string; label: string }) => {
  return (
    <motion.div 
      className={styles.statContainer}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Text className={styles.statValue}>{value}</Text>
      <Text className={styles.statLabel}>{label}</Text>
    </motion.div>
  );
};

// Componente para el Feature Carousel
interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Car,
    title: 'Viajes Compartidos',
    description: 'Conecta con conductores y viajeros en tu ruta',
    color: '#00ff9d'
  },
  {
    icon: Users,
    title: 'Comunidad Verificada',
    description: 'Red de usuarios confiables y calificados',
    color: '#00ccff'
  },
  {
    icon: Shield,
    title: 'Viajes Seguros',
    description: 'Seguimiento en tiempo real y verificación',
    color: '#ff9d00'
  },
  {
    icon: Star,
    title: 'Experiencias Únicas',
    description: 'Conoce personas increíbles mientras viajas',
    color: '#ff00ff'
  },
  {
    icon: MapPin,
    title: 'Rutas Flexibles',
    description: 'Encuentra viajes que se ajusten a tus planes',
    color: '#9d00ff'
  },
  {
    icon: Clock,
    title: 'Ahorra Tiempo',
    description: 'Organiza tus viajes de manera eficiente',
    color: '#ff0099'
  }
];

const HomeView = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Actualizar el valor de scrollY al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Usar el valor de scrollY para aplicar estilos condicionales
  const heroStyle = {
    opacity: scrollY > 100 ? 0.5 : 1,
    transform: scrollY > 100 ? 'scale(0.9)' : 'scale(1)',
  };

  return (
    <Container fluid className={styles.container}>
      {/* Hero Section */}
      <motion.div 
        className={styles.heroSection}
        ref={heroRef}
        style={{ ...heroStyle, opacity: heroOpacity, scale: heroScale }}
      >
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Title className={styles.heroTitle}>
              Viaja de manera
              <span className={styles.heroHighlight}> inteligente</span>
            </Title>
            <Text className={styles.heroSubtitle}>
              Conecta con conductores y viajeros. Ahorra dinero y cuida el planeta.
            </Text>
            <Group className={styles.heroButtons}>
              <Button
                size="xl"
                className={styles.primaryButton}
                component={Link}
                to="/reservar"
                rightSection={<ArrowRight size={20} />}
              >
                Encuentra tu viaje
              </Button>
              <Button
                size="xl"
                variant="outline"
                className={styles.secondaryButton}
                component={Link}
                to="/publish"
              >
                Publica un viaje
              </Button>
            </Group>
          </motion.div>
        </div>
        <div className={styles.heroVisual} />
      </motion.div>

      {/* Stats Section */}
      <Box className={styles.statsSection}>
        <Group justify="center" className={styles.statsGrid}>
          <AnimatedStat value="50K+" label="Usuarios activos" />
          <AnimatedStat value="100K+" label="Viajes completados" />
          <AnimatedStat value="30M+" label="Kilómetros recorridos" />
          <AnimatedStat value="95%" label="Usuarios satisfechos" />
        </Group>
      </Box>

      {/* Features Section */}
      <Box className={styles.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Title className={styles.sectionTitle}>
            <span className={styles.titleHighlight}>Beneficios</span> únicos
          </Title>
          <Text className={styles.sectionSubtitle}>
            Descubre por qué miles de personas eligen Cupo
          </Text>
        </motion.div>
        <Box className={styles.features3D}>
          <FeatureCarousel features={features} />
        </Box>
      </Box>

      {/* Destinations Section */}
      <Box className={styles.destinationsSection}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Title className={styles.sectionTitle}>
            Destinos <span className={styles.titleHighlight}>populares</span>
          </Title>
          <Text className={styles.sectionSubtitle}>
            Explora los destinos más solicitados por nuestra comunidad
          </Text>
        </motion.div>
        <CardsCarousel />
      </Box>

      {/* CTA Section */}
      <Box className={styles.ctaSection}>
        <Card className={styles.ctaCard}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Title className={styles.ctaTitle}>
              ¿Listo para comenzar?
            </Title>
            <Text className={styles.ctaText}>
              Únete a nuestra comunidad y comienza a viajar de manera inteligente
            </Text>
            <Button
              size="xl"
              className={styles.ctaButton}
              component={Link}
              to="/register"
              rightSection={<BadgeCheck size={20} />}
            >
              Crear cuenta gratis
            </Button>
          </motion.div>
        </Card>
      </Box>
    </Container>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomeView,
});

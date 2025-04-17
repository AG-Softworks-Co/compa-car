import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Card,
  Button,
  Box,
  Group,
} from '@mantine/core';
import { Car, Globe, PiggyBank, Users, MapPin, Leaf } from 'lucide-react';
import styles from './home.module.css';
import { CardsCarousel } from '../../components/ui/home/features';
import { FeatureCarousel } from '../../components/ui/home/FeatureCarousel';


const HomeView = () => {
  const features = [
    {
      icon: Car,
      title: "Viajes compartidos",
      description: "Conecta con conductores y viajeros que comparten tu ruta.",
      color: "#00ff9d",
    },
    {
      icon: Globe,
      title: "Destinos nacionales",
      description:
        "Viaja a cualquier destino dentro del país de manera segura.",
      color: "#00ccff",
    },
    {
      icon: PiggyBank,
      title: "Ahorra en viajes",
      description: "Reduce tus costos de transporte compartiendo gastos.",
      color: "#ff9d00",
    },
    {
      icon: Users,
      title: "Comunidad confiable",
      description: "Usuarios verificados y sistema de reputación.",
      color: "#ff00ff",
    },
    {
      icon: MapPin,
      title: "Rutas flexibles",
      description:
        "Encuentra o publica viajes que se ajusten a tus necesidades.",
      color: "#9d00ff",
    },
    {
      icon: Leaf,
      title: "Eco-friendly",
      description: "Reduce tu huella de carbono compartiendo vehículo.",
      color: "#00ff9d",
    },
  ];

  return (
    <Container fluid className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <Title className={styles.heroTitle}>
            Tu viaje más inteligente
            <span className={styles.heroHighlight}> empieza aquí</span>
          </Title>
          <Text className={styles.heroSubtitle}>
            Conecta, comparte y viaja de manera sostenible
          </Text>
          <Group className={styles.heroButtons}>
            <Button
              size="lg"
              className={styles.primaryButton}
              component={Link}
              to="/reservar"
            >
              Buscar viaje
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={styles.secondaryButton}
              component={Link}
              to="/publicarviaje"
            >
              Publicar viaje
            </Button>
          </Group>
        </div>
        <div className={styles.heroVisual} />
      </div>

      {/* Features Section */}
      <Box className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <Title order={2} className={styles.sectionTitle}>
            <span className={styles.titleGlow}>La mejor forma</span> de viajar
          </Title>
          <Text className={styles.sectionSubtitle}>
            Descubre por qué miles de personas eligen Cupo para sus viajes
            diarios
          </Text>
        </div>
        <FeatureCarousel features={features} />
      </Box>

     
      {/* Destinations Section */}
      <Box className={styles.destinationsSection}>
        <Title order={2} className={styles.sectionTitle}>
          Destinos <span className={styles.titleGlow}>populares</span>
        </Title>
        <CardsCarousel />
      </Box>

      {/* CTA Section */}
      <Box className={styles.ctaSection}>
        <Card className={styles.ctaCard}>
          <Title order={2} className={styles.ctaTitle}>
            ¿Listo para empezar?
          </Title>
          <Text className={styles.ctaText}>
            Únete a nuestra comunidad y comienza a ahorrar
          </Text>
          <Button
            className={styles.registerButton}
            component="a" // Usar un enlace HTML
            href="https://www.cupo.dev" // URL de destino
            target="_blank" // Abrir en una nueva pestaña
            rel="noopener noreferrer" // Seguridad para enlaces externos
          >
            <span>Más información</span>
          </Button>
          <div className={styles.ctaGlow} />
        </Card>
      </Box>
    </Container>
  );
};

export const Route = createFileRoute("/home/")({
  component: HomeView,
});

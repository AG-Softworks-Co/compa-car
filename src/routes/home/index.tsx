import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Button
} from '@mantine/core';
import { Car, Globe, PiggyBank } from 'lucide-react';
import styles from './home.module.css';
import { CardsCarousel } from '../../components/ui/home/features';

interface FeatureProps {
  icon: React.ElementType;
  title: string;
}

const Feature = ({ icon: Icon, title }: FeatureProps) => (
  <Card className={styles.featureCard}>
    <Icon size={40} className={styles.featureIcon} />
    <Text size="sm" fw={500} mt="xs">
      {title}
    </Text>
  </Card>
);

const HomeView = () => {
  const features = [
    { icon: Car, title: 'Viajes compartidos' },
    { icon: Globe, title: 'Destinos nacionales' },
    { icon: PiggyBank, title: 'Ahorra en viajes' },
  ];

  return (
    <Container className={styles.container}>
      <Card className={styles.heroCard}>
        <Title className={styles.heroTitle}>VIAJES COMPARTIDOS</Title>
        <Text className={styles.heroSubtitle}>Ahorra y cuida el planeta</Text>
        <Button
          size="md"
          className={styles.ctaButton}
          component={Link}
          to="/reservar"
        >
          Conoce más aquí
        </Button>
      </Card>

      <Title order={2} className={styles.sectionTitle}>
        ¿Qué ofrece CarpoolApp?
      </Title>
      <SimpleGrid cols={3} spacing="xs" className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </SimpleGrid>

      <Title order={2} className={styles.sectionTitle}>
        Destinos populares
      </Title>


      <CardsCarousel />
    </Container>

  );
};

export const Route = createFileRoute('/home/')({
  component: HomeView,
});
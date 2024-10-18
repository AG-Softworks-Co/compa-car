import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, TextInput, Button, Title, Card, Text, Container } from '@mantine/core';
import { Search, Calendar, User } from 'lucide-react';
import styles from './reservar.module.css';

const ReservarView: React.FC = () => {
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Buscando viajes...');
  };

  return (
    <Container size="lg" mt="xl">
      <Box className={styles.logoOverlay} />
      <Card className={styles.searchCard}>
        <Text className={styles.cardTitle} size="xl" fw={700} ta="center" mb="xl">
          Miles de viajes a muy buen precio
        </Text>
        <form onSubmit={handleSearch}>
          <TextInput
            className={styles.searchInput}
            placeholder="De"
            leftSection={<Search size={18} />}
          />
          <TextInput
            className={styles.searchInput}
            placeholder="A"
            leftSection={<Search size={18} />}
          />
          <TextInput
            className={styles.searchInput}
            placeholder="Hoy"
            leftSection={<Calendar size={18} />}
          />
          <TextInput
            className={styles.searchInput}
            placeholder="1"
            leftSection={<User size={18} />}
          />
          <Button className={styles.searchButton} type="submit">
            Buscar
          </Button>
        </form>
      </Card>

      <Title order={2} size="h3" mt="xl" mb="md">Resultados de la búsqueda</Title>
      <Text c="dimmed">Realiza una búsqueda para ver los resultados de viajes disponibles.</Text>
    </Container>
  );
};

export const Route = createFileRoute('/reservar/')({
  component: ReservarView
});
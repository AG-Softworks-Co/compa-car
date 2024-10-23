import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Box,
  TextInput,
  Button,
  Container,
  Text,
  Checkbox,
  Stack,
  Group,
  UnstyledButton,
} from '@mantine/core';
import { ArrowLeft, Eye, EyeOff, Car, MapPin } from 'lucide-react';
import styles from './index.module.css';

const RegisterView: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    // Iniciar la animación de búsqueda
    setIsSearching(true);

    // Simular la búsqueda (animación dura 5 segundos)
    setTimeout(() => {
      setIsSearching(false);
      console.log('Búsqueda completada...');
    }, 5000);
  };

  return (
    <Container className={styles.container}>
      <Group justify="flex-start" mb="xl">
        <UnstyledButton component={Link} to="/" className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
      </Group>

      <Box className={styles.logoSection}>
        <Box className={styles.logo}>
          <img src="/Logo.png" alt="Compaccar Logo" />
        </Box>
        <Text size="xl" fw={700} className={styles.title}>
          Bienvenido a Cupo
        </Text>
        <Text size="sm" c="dimmed" className={styles.subtitle}>
          Crea tu cuenta y comienza a viajar con nosotros.
        </Text>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            placeholder="Correo electrónico"
            className={styles.input}
            size="lg"
            required
          />

          <TextInput
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            className={styles.input}
            size="lg"
            required
            rightSection={
              <UnstyledButton
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </UnstyledButton>
            }
          />

          <TextInput
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirma tu contraseña"
            className={styles.input}
            size="lg"
            required
            rightSection={
              <UnstyledButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </UnstyledButton>
            }
          />

          <Checkbox
            label="Al continuar aceptas nuestros términos, condiciones y política de tratamiento de datos personales"
            className={styles.checkbox}
            size="md"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.currentTarget.checked)}
            required
          />

          <Button
            fullWidth
            size="lg"
            className={`${styles.continueButton} ${isSearching ? styles.searching : ''}`}
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className={styles.searchingAnimation}>
                <div className={styles.carContainer}>
                  <Car className={styles.carIcon} size={24} />
                </div>
                <div className={styles.road}>
                  <div className={styles.destination}>
                    <MapPin size={24} className={styles.destinationIcon} />
                  </div>
                </div>
              </div>
            ) : (
              'Buscar'
            )}
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export const Route = createFileRoute('/Registro/')({
  component: RegisterView,
});

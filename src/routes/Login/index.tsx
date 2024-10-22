import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  TextInput,
  Button,
  Container,
  Text,
  Group,
  UnstyledButton,
} from '@mantine/core';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import styles from './index.module.css';

const LoginView: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Iniciando sesión...');
  };

  const handleForgotPassword = () => {
    navigate({ to: '/RecuperarPasword' });
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
          <img src="/Logo.png" alt="Cupo Logo" />
        </Box>
        <Text className={styles.title}>
          Hola de nuevo, <span className={styles.userName}>Usuario</span>
        </Text>
        <Text className={styles.subtitle}>
          Hoy es un gran día para viajar con nosotros.
        </Text>
      </Box>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Correo electrónico</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            className={styles.input}
            size="lg"
            required
          />
        </Box>

        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Contraseña</Text>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
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
        </Box>

        <Button
          fullWidth
          size="lg"
          className={styles.loginButton}
          type="submit"
        >
          Ingresar
        </Button>

        <UnstyledButton 
          className={styles.forgotPassword}
          onClick={handleForgotPassword}
        >
          Olvidé mi contraseña
        </UnstyledButton>
      </form>

      <Text className={styles.version}>v2.54.4 (964)</Text>
    </Container>
  );
};

export const Route = createFileRoute('/Login/')({
  component: LoginView
});
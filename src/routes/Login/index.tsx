import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  TextInput,
  Button,
  Container,
  Text,
  Group,
  UnstyledButton,
  LoadingOverlay,
} from "@mantine/core";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import styles from "./index.module.css";
import { useForm } from "@mantine/form";

interface LoginFormValues {
  email: string;
  password: string;
}




const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const LoginView: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Correo electrónico inválido"),
      password: (value) => (value.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : null),
    }
  });

  const checkUserProfile = async (userId: number, token: string): Promise<boolean> => {
    try {
      console.log('Verificando perfil para usuario:', userId);
      
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          'x-token': token
        }
      });

      const responseData = await response.json();
      console.log('Respuesta verificación perfil:', responseData);

      // Si la respuesta es exitosa y tiene datos, el perfil existe
      if (response.ok && responseData.data) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verificando perfil:', error);
      return false;
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      setError("");

      // 1. Autenticación inicial
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo: values.email,
          password: values.password,
        })
      });

      const loginData = await loginResponse.json();
      console.log('Respuesta login:', loginData);

      if (!loginResponse.ok || !loginData.ok) {
        setError(loginData.msj || "Error en la autenticación");
        return;
      }

      // 2. Guardar datos de sesión
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("userEmail", values.email);
      localStorage.setItem("userId", loginData.idusuario.toString());

      try {
        // 3. Verificar si el usuario ya tiene perfil
        const hasProfile = await checkUserProfile(
          loginData.idusuario,
          loginData.token
        );

        // 4. Redirigir según corresponda
        if (hasProfile) {
          console.log('Usuario tiene perfil, redirigiendo a home');
          navigate({ to: "/home" });
        } else {
          console.log('Usuario necesita completar perfil');
          navigate({ to: "/CompletarRegistro" });
        }
      } catch (error) {
        console.error('Error verificando perfil:', error);
        setError("Error al verificar el perfil de usuario");
        localStorage.clear();
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setError("Error al conectar con el servidor");
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.container}>
      <LoadingOverlay visible={loading} />
      
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

      <form onSubmit={form.onSubmit(handleLogin)} className={styles.form}>
        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Correo electrónico</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps("email")}
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
            {...form.getInputProps("password")}
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

        {error && (
          <Text color="red" size="sm" className={styles.errorMessage}>
            {error}
          </Text>
        )}

        <Button
          loading={loading}
          fullWidth
          size="lg"
          className={styles.loginButton}
          type="submit"
        >
          Ingresar
        </Button>

        <UnstyledButton
          className={styles.forgotPassword}
          onClick={() => navigate({ to: "/RecuperarPasword" })}
        >
          Olvidé mi contraseña
        </UnstyledButton>
      </form>

      <Text className={styles.version}>v 0.0.1 (0)</Text>
    </Container>
  );
};

export const Route = createFileRoute("/Login/")({
  component: LoginView,
});
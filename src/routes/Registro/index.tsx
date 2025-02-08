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
import { supabase } from "@/lib/supabaseClient";

interface RegisterFormValues {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterView: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    initialValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      nombre: (value) => (value.length < 3 ? "El nombre debe tener al menos 3 caracteres" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Correo electrónico inválido"),
      password: (value) => (value.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : null),
      confirmPassword: (value, values) =>
        value !== values.password ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      setError("");

      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.nombre,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear perfil inicial en user_profiles
      console.log({
          user_id: authData.user.id,
          first_name: values.nombre.split(' ')[0],
          last_name: values.nombre.split(' ').slice(1).join(' ') || '',
          identification_type: 'CC',
          identification_number: '0000000000', // Temporal
          status: 'PENDING_COMPLETION'
        })
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: values.nombre.split(' ')[0],
          last_name: values.nombre.split(' ').slice(1).join(' ') || '',
          identification_type: 'CC',
          identification_number: '0000000000', // Temporal
          status: 'PENDING_COMPLETION'
        });

      if (profileError) throw profileError;

      // 3. Éxito - redirigir al login
      alert("Usuario creado correctamente. Por favor, verifica tu correo electrónico.");
      navigate({ to: "/Login" });

    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error instanceof Error 
          ? error.message
          : "Error al crear el usuario"
      );
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
        <Text className={styles.title}>Crear una cuenta</Text>
        <Text className={styles.subtitle}>
          Únete a nosotros y empieza a viajar.
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(handleRegister)} className={styles.form}>

      <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Nombre completo </Text>
          <TextInput
            placeholder="Tu nombre completo"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps("nombre")}
          />
        </Box>
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

        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Confirmar Contraseña</Text>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="Confirma tu contraseña"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps("confirmPassword")}
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
          Registrarse
        </Button>
      </form>


    </Container>
  );
};

export const Route = createFileRoute("/Registro/")({
  component: RegisterView,
});

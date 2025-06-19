import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Box,
  TextInput,
  Button,
  Container,
  Text,
  Group,
  UnstyledButton,
  LoadingOverlay,
  Checkbox,
} from "@mantine/core";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useForm } from "@mantine/form";
import styles from "./index.module.css";
import { TermsModal } from "@/components/TermsModal";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormValues {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterView: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cookiesBlocked, setCookiesBlocked] = useState(false);

  const navigate = useNavigate();
  const { signup, loading: authLoading } = useAuth();

  // Verifica si las cookies están bloqueadas
  useEffect(() => {
    document.cookie = "testcookie=1; SameSite=None; Secure";
    if (!document.cookie.includes("testcookie")) {
      setCookiesBlocked(true);
      setError("Tu navegador bloquea las cookies. Actívalas para continuar.");
    }
  }, []);

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
      setError("");

      const success = await signup(
        values.email,
        values.password,
        values.nombre,
        acceptTerms ? "aceptado" : "rechazado",
        subscribeEmails ? "aceptado" : "rechazado"
      );


      if (success) {
        await new Promise(resolve => setTimeout(resolve, 300));
        alert("Usuario creado correctamente. Por favor, verifica tu correo electrónico.");
        navigate({ to: "/Login" });
      } else {
        setError("Error al registrar usuario");
      }

    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Error al crear el usuario");
    }
  };

  return (
    <Container className={styles.container}>
      <LoadingOverlay visible={authLoading} />

      <Group justify="flex-start" mb="xl">
        <UnstyledButton component={Link} to="/" className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
      </Group>

      <Box className={styles.logoSection}>
        <Box className={styles.logo}>
          <img
            src="https://mqwvbnktcokcccidfgcu.supabase.co/storage/v1/object/public/Resources/Home/Logo.png"
            alt="Cupo Logo"
          />
        </Box>
        <Text className={styles.title}>Crear una cuenta</Text>
        <Text className={styles.subtitle}>Únete a nosotros y empieza a viajar.</Text>
      </Box>

      <form
        onSubmit={form.onSubmit((values) => {
          if (!acceptTerms) {
            setError("Debes aceptar los Términos y Condiciones para continuar.");
            return;
          }
          if (cookiesBlocked) {
            setError("Tu navegador bloquea las cookies. Actívalas para continuar.");
            return;
          }
          handleRegister(values);
        })}
        className={styles.form}
      >
        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Nombre completo</Text>
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
              <UnstyledButton onClick={() => setShowPassword(!showPassword)} className={styles.eyeButton}>
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
              <UnstyledButton onClick={() => setShowPassword(!showPassword)} className={styles.eyeButton}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </UnstyledButton>
            }
          />
        </Box>

        <Checkbox
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.currentTarget.checked)}
          label={
            <>
              Acepto los{" "}
              <span
                onClick={() => setShowTermsModal(true)}
                onMouseDown={(e) => e.preventDefault()} // <--- esto previene el conflicto con el Checkbox
                style={{
                  color: "#00b894",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Términos y Condiciones
              </span>
            </>
          }
          required
          mt="md"
        />

        <Checkbox
          checked={subscribeEmails}
          onChange={(e) => setSubscribeEmails(e.currentTarget.checked)}
          label="Deseo recibir correos con información y promociones"
          mt="sm"
        />

        {error && (
          <Text color="red" size="sm" className={styles.errorMessage}>
            {error}
          </Text>
        )}

        <Button
          loading={authLoading}
          fullWidth
          size="lg"
          className={styles.loginButton}
          type="submit"
          mt="xl"
          disabled={cookiesBlocked}
        >
          Registrarse
        </Button>
      </form>

      {/* Modal profesional y reutilizable */}
      <TermsModal opened={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </Container>
  );
};

export const Route = createFileRoute("/Registro/")({
  component: RegisterView,
});

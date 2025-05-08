import React, { useState } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import styles from "./index.module.css";
import { TermsModal } from "@/components/TermsModal";

interface RegisterFormValues {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterView: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: authData.user.id,
        first_name: values.nombre.split(" ")[0],
        last_name: values.nombre.split(" ").slice(1).join(" ") || "",
        identification_type: "CC",
        identification_number: null,
        status: "PASSENGER",
      });

      if (profileError) throw profileError;

      await supabase.from("terms_condictions").insert({
        user_id: authData.user.id,
        verification_terms: acceptTerms ? "aceptado" : "rechazado",
        suscriptions: subscribeEmails ? "aceptado" : "rechazado",
      });

      alert("Usuario creado correctamente. Por favor, verifica tu correo electrónico.");
      navigate({ to: "/Login" });
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Error al crear el usuario");
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
              <UnstyledButton
                type="button"
                onClick={() => setShowTermsModal(true)}
                style={{ color: "#00b894", textDecoration: "underline" }}
              >
                Términos y Condiciones
              </UnstyledButton>
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

        <Button loading={loading} fullWidth size="lg" className={styles.loginButton} type="submit" mt="xl">
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

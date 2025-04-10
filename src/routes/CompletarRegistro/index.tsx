import type React from "react";
import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Box,
  TextInput,
  Select,
  Button,
  Container,
  Text,
  Group,
  UnstyledButton,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { ArrowLeft, AlertCircle } from "lucide-react";
import styles from "./index.module.css";
import { useForm } from "@mantine/form";
import { supabase } from "@/lib/supabaseClient";

interface ProfileFormData {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  identification_type: string;
  identification_number: string;
  user_type: string;

}


const CompleteProfileView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ProfileFormData>({
    initialValues: {
      id: 0,
      email: "",
      phone_number: "",
      first_name: "",
      last_name: "",
      identification_type: "CC",
      identification_number: "",
      user_type: "PASSENGER",
    },
    validate: {
      phone_number: (value) => {
        if (!value) return "El número de teléfono es requerido";
        if (!/^\d{10}$/.test(value)) return "El número debe tener 10 dígitos";
        return null;
      },
      first_name: (value) => {
        if (!value) return "El nombre es requerido";
        if (value.length < 3) return "El nombre debe tener al menos 3 caracteres";
        if (value.length > 3) return "no se peuydes";
        return null;
      },
      last_name: (value) => {
        if (!value) return "El apellido es requerido";
        if (value.length < 3) return "El apellido debe tener al menos 3 caracteres";
        return null;
      },
      identification_number: (value) => {
        if (!value) return "El número de identificación es requerido";
        if (value.length < 6) return "El número debe tener al menos 6 caracteres";
        return null;
      }
    }
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('No se encontraron datos de sesión');
          navigate({ to: "/Login" });
          return;
        }

        // Intentar cargar el perfil existente
        try {
          console.log('Verificando perfil existente...');
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;

          if (profile) {
            console.log('Perfil encontrado, cargando datos...');
            setIsEditing(true);
            form.setValues({
              id: profile.id,
              email: user.email || '',
              phone_number: user.phone || '',
              first_name: profile.first_name,
              last_name: profile.last_name,
              identification_type: profile.identification_type,
              identification_number: profile.identification_number,
              user_type: profile.status || 'PASSENGER'
            });
          } else {
            console.log('Perfil no encontrado, iniciando nuevo registro');
            form.setValues({
              ...form.values,
              email: user.email || '',
              phone_number: user.phone || ''
            });
          }
        } catch (error) {
          console.error('Error cargando perfil:', error);
          form.setValues({
            ...form.values,
            email: user.email || '',
            phone_number: user.phone || ''
          });
        }

      } catch (error) {
        console.error('Error en inicialización:', error);
        setError("Error al cargar los datos del perfil");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleSubmit = async (values: ProfileFormData) => {
    try {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No se encontró la sesión del usuario");
      }

      const profileData = {
        user_id: user.id,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        identification_type: values.identification_type,
        identification_number: values.identification_number.trim(),
        status: values.user_type
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_profiles')
          .insert([profileData]);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('Perfil guardado exitosamente');
      if (values.user_type === "PASSENGER") {
        navigate({ to: "/" });
      } else if (values.user_type === "DRIVER") {
        navigate({ to: "/RegistrarVehiculo" });
      }

    } catch (error: any) {
      console.error('Error guardando perfil:', error);
      setError(error.message || "Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: "/Login" });
  };

  if (initialLoading) {
    return (
      <Container className={styles.container}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <LoadingOverlay visible={loading} />

      <Group justify="flex-start" mb="xl">
        <UnstyledButton onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
      </Group>

      <Paper className={styles.formWrapper}>
        <Box className={styles.header}>
          <Text className={styles.title}>
            {isEditing ? 'Actualizar perfil' : 'Completa tu perfil'}
          </Text>
          <Text className={styles.subtitle}>
            {isEditing 
              ? 'Actualiza tu información personal'
              : 'Necesitamos algunos datos adicionales para completar tu registro'
            }
          </Text>
        </Box>

        <form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            {...form.getInputProps("email")}
            disabled
            className={styles.input}
          />

          <TextInput
            label="Nombre"
            placeholder="Ingresa tu nombre"
            required
            {...form.getInputProps("first_name")}
            className={styles.input}
          />

          <TextInput
            label="Apellidos"
            placeholder="Ingresa tus apellidos"
            required
            {...form.getInputProps("last_name")}
            className={styles.input}
          />

          <Select
            label="Tipo de identificación"
            placeholder="Selecciona el tipo"
            data={[
              { value: "CC", label: "Cédula de Ciudadanía" },
              { value: "CE", label: "Cédula de Extranjería" },
              { value: "PAS", label: "Pasaporte" },
            ]}
            required
            {...form.getInputProps("identification_type")}
            className={styles.input}
          />

          <TextInput
            label="Número de identificación"
            placeholder="Ingresa tu número de identificación"
            required
            {...form.getInputProps("identification_number")}
            className={styles.input}
          />

          <TextInput
            label="Teléfono"
            placeholder="Ingresa tu número de teléfono"
            required
            {...form.getInputProps("phone_number")}
            className={styles.input}
          />

          <Select
            label="Tipo de usuario"
            placeholder="Selecciona el tipo de usuario"
            data={[
              { value: "PASSENGER", label: "Pasajero" },
              { value: "DRIVER", label: "Conductor" },
            ]}
            required
            {...form.getInputProps("user_type")}
            className={styles.input}
          />

          {error && (
            <Text color="red" size="sm" className={styles.errorMessage}>
              <AlertCircle size={16} style={{ marginRight: 8 }} />
              {error}
            </Text>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className={styles.submitButton}
          >
            {isEditing ? 'Actualizar información' : 'Guardar información'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export const Route = createFileRoute("/CompletarRegistro/")({
  component: CompleteProfileView,
});
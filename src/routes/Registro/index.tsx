import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Box,
  TextInput,
  Button,
  Container,
  Text,
  Group,
  UnstyledButton,
} from '@mantine/core'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import styles from './index.module.css'
import { useForm } from '@mantine/form'
import ky from 'ky'

const RegisterView: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const navigate = useNavigate()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleRegister = async (values: {
    email: string
    password: string
    confirmPassword: string
  }) => {
    if (values.password !== values.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    const res = await ky
      .post(
        'https://rest-sorella-production.up.railway.app/api/usuarios_compacar',
        {
          json: {
            correo: values.email,
            password: values.password,
          },
        },
      )
      .json()
    console.log(res)
    navigate({ to: '/Login' })
  }

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
        <Text className={styles.title}>Crear una cuenta</Text>
        <Text className={styles.subtitle}>
          Únete a nosotros y empieza a viajar.
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(handleRegister)} className={styles.form}>
        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Correo electrónico</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps('email')}
          />
        </Box>

        <Box className={styles.inputWrapper}>
          <Text className={styles.inputLabel}>Contraseña</Text>
          <TextInput
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps('password')}
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
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirma tu contraseña"
            className={styles.input}
            size="lg"
            required
            {...form.getInputProps('confirmPassword')}
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
          Registrarse
        </Button>
      </form>

      <Text className={styles.version}>v2.54.4 (964)</Text>
    </Container>
  )
}

export const Route = createFileRoute('/Registro/')({
  component: RegisterView,
})

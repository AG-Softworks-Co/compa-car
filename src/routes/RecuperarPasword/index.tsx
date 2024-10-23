import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  Container,
  Text,
  Group,
  UnstyledButton,
  Button,
  Center,
} from '@mantine/core';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import styles from './index.module.css';

const RecoverPasswordView: React.FC = () => {
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const inputRefs = Array(6).fill(0).map(() => React.createRef<HTMLInputElement>());

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Mover al siguiente input si hay un valor
      if (value && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Código ingresado:', code.join(''));
  };

  return (
    <Container className={styles.container}>
      <Group justify="space-between" className={styles.header}>
        <UnstyledButton component={Link} to="/login" className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
        <Text className={styles.headerTitle}>Recuperar contraseña</Text>
        <Box style={{ width: 24 }} /> {/* Espaciador para centrar el título */}
      </Group>

      <Box className={styles.content}>
        <Center className={styles.iconWrapper}>
          <Mail className={styles.icon} size={40} color="#FFD700" />
        </Center>

        <Text className={styles.title}>
          Ingresa el código enviado a tu correo:
        </Text>
        
        <Text className={styles.email}>
          jhojanolivares.jo@gmail.com
        </Text>

        <Text className={styles.subtitle}>
          (Podría llegar a tu correo no deseado)
        </Text>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.codeInputs}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.codeInput}
                inputMode="numeric"
                pattern="\d*"
                autoComplete="off"
              />
            ))}
          </div>

          <Button 
            fullWidth
            size="lg"
            className={styles.confirmButton}
            type="submit"
          >
            Confirmar
          </Button>

          <Button 
            fullWidth
            variant="outline"
            size="lg"
            className={styles.resendButton}
          >
            Reenviar código
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export const Route = createFileRoute('/RecuperarPasword/')({
  component: RecoverPasswordView
});
import styles from "./root.module.css";
import {
  AppShell,
  Group,
  MantineProvider,
  Text,
  UnstyledButton,
  Button,
  Box,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Search, PlusCircle, Home, MessageCircle, User } from 'lucide-react';

const theme = createTheme({
  fontFamily: "Inter, sans-serif",
  colors: {
    brand: [
      "#e6fff2",
      "#b3ffe0",
      "#80ffce",
      "#4dffbc",
      "#1affaa",
      "#00e699",
      "#00cc88",
      "#00b377",
      "#009966",
      "#008055"
    ],
  },
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 8 },
});

const navItems = [
  { icon: Home, label: 'Inicio', to: '/home' },
  { icon: Search, label: 'Buscar', to: '/reservar' },
  { icon: PlusCircle, label: 'Publicar', to: '/publish' },
  { icon: MessageCircle, label: 'Mensajes', to: '/messages' },
  { icon: User, label: 'Perfil', to: '/profile' },
];

export const Route = createRootRoute({
  component: () => {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell
          padding="md"
          header={{ height: 60 }}
          footer={{ height: 60 }}
          className={styles.appShell}
        >
          <AppShell.Header className={styles.header}>
            <Group justify="space-between" className={styles.headerContent}>
              <Text className={styles.logo}>CarpoolApp</Text>
              <Button 
                className={styles.registerButton}
                component={Link}
                to="/register"
              >
                Inscríbete aquí
              </Button>
            </Group>
          </AppShell.Header>

          <AppShell.Main className={styles.main}>
            <Outlet />
          </AppShell.Main>

          <AppShell.Footer className={styles.footer}>
            <Group grow className={styles.navGroup}>
              {navItems.map((item) => (
                <UnstyledButton
                  key={item.label}
                  component={Link}
                  to={item.to}
                  className={styles.navButton}
                >
                  <Box className={styles.navIcon}>
                    <item.icon size={20} />
                  </Box>
                  <Text className={styles.navLabel}>
                    {item.label}
                  </Text>
                </UnstyledButton>
              ))}
            </Group>
          </AppShell.Footer>
        </AppShell>
        <Notifications />
      </MantineProvider>
    );
  },
});
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
  Image,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { Home, Search, Car, User } from 'lucide-react';

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
  { icon: 'logo', label: '', to: '/publish' },
  { icon: Car, label: 'Mis Viajes', to: '/my-trips' },
  { icon: User, label: 'Mi Cuenta', to: '/profile' },
];

export const Route = createRootRoute({
  component: () => {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell
          header={{ height: 60 }}
          footer={{ height: 60 }}
          className={styles.appShell}
        >
          <AppShell.Header className={styles.header}>
            <Group justify="space-between" className={styles.headerContent}>
              <Text className={styles.logo}>Cupo</Text>
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
            <Group className={styles.navGroup}>
              {navItems.map((item, index) => (
                <UnstyledButton
                  key={item.label || `nav-item-${index}`}
                  component={Link}
                  to={item.to}
                  className={`${styles.navButton} ${index === 2 ? styles.centerButton : ''}`}
                >
                  {index === 2 ? (
                    <Box className={styles.logoWrapper}>
                      <Image src="/public/9.png" className={styles.logoImage} />
                    </Box>
                  ) : (
                    <>
                      <Box className={styles.navIcon}>
                        <item.icon size={24} />
                      </Box>
                      <Text className={styles.navLabel}>
                        {item.label}
                      </Text>
                    </>
                  )}
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
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
import {
  createRootRoute,
  Outlet,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { Search, PlusCircle, Car, User } from "lucide-react";

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
      "#008055",
    ],
  },
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 8 },
});

const navItems = [
  { icon: Search, label: "Buscar", to: "/reservar" },
  { icon: PlusCircle, label: "Publicar", to: "/publish" },
  { icon: "logo", label: "", to: "/home" },
  { icon: Car, label: "Mis Viajes", to: "/my-trips" },
  { icon: User, label: "Mi Cuenta", to: "/profile" },
];

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell
          header={{ height: location.pathname !== "/" ? 60 : 0 }}
          footer={{ height: 60 }}
          className={styles.appShell}
        >
          <div className={styles.backgroundEffect} />

          {location.pathname !== "/" && (
            <AppShell.Header className={styles.header}>
              <Group justify="space-between" className={styles.headerContent}>
                <Text className={styles.logo}>Cupo</Text>
                <Button
                  className={styles.registerButton}
                  component={Link}
                  to="/register"
                >
                  <span>Inscríbete aquí</span>
                </Button>
              </Group>
            </AppShell.Header>
          )}

          <AppShell.Main className={styles.main}>
            <Outlet />
          </AppShell.Main>

          {location.pathname !== "/" && (
            <AppShell.Footer className={styles.footer}>
              <Group className={styles.navGroup}>
                {navItems.map((item, index) => (
                  <UnstyledButton
                    key={item.label || `nav-item-${index}`}
                    component={Link}
                    to={item.to}
                    className={`${styles.navButton} ${index === 2 ? styles.centerButton : ""}`}
                  >
                    {index === 2 ? (
                      <Box className={styles.logoWrapper}>
                        <Image
                          src="/Logo.png"
                          alt="Logo"
                          className={styles.logoImage}
                        />
                      </Box>
                    ) : (
                      <>
                        <Box className={styles.navIcon}>
                          <item.icon size={24} />
                        </Box>
                        <Text className={styles.navLabel}>{item.label}</Text>
                      </>
                    )}
                  </UnstyledButton>
                ))}
              </Group>
            </AppShell.Footer>
          )}
        </AppShell>
        <Notifications />
      </MantineProvider>
    );
  },
});

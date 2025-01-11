import { createRootRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
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
import '@mantine/dates/styles.css';
import { Search, PlusCircle, Car, User } from "lucide-react";
import { config } from "telefunc/client";
import styles from "./root.module.css";

// Configure telefunc
config.telefuncUrl = "http://localhost:3000/_telefunc";

// Theme configuration
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

// Navigation items configuration
const navItems = [
  { icon: Search, label: "Buscar", to: "/reservar" },
  { icon: PlusCircle, label: "Publicar", to: "/publicarviaje" },
  { icon: "logo", label: "", to: "/home" },
  { icon: Car, label: "Actividades", to: "/Actividades" },
  { icon: User, label: "Mi Cuenta", to: "/perfil" },
];

// Routes that shouldn't show the navigation bar
const noNavBarRoutes = [
  "/",
  "/Login",
  "/Registro",
  "/RecuperarPasword",
  "/Origen",
  "/Destino",
  "/publicarviaje",
  "/RegistrarVehiculo",
  "/RegistrarVehiculo/Documentos",
  "/DetallesViaje",
  "/PagarCupo",
  "/Reservas",
  "/CompletarRegistro",
  "/PagarCupo",
  "/ConfirmarCupo",

];

const RootComponent = () => {
  const location = useLocation();
  const showNavigation = !noNavBarRoutes.includes(location.pathname);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppShell
        header={{ height: showNavigation ? 60 : 0 }}
        footer={{ height: 60 }}
        className={styles.appShell}
      >
        <div className={styles.backgroundEffect} />

        {showNavigation && (
          <AppShell.Header className={styles.header}>
            <Group justify="space-between" className={styles.headerContent}>
              <Text className={styles.logo}>Cupo</Text>
              <Button
                className={styles.registerButton}
                component={Link}
                to="/CompletarRegistro"
              >
                <span>Inscríbete aquí</span>
              </Button>
            </Group>
          </AppShell.Header>
        )}

        <AppShell.Main className={styles.main}>
          <Outlet />
        </AppShell.Main>

        {showNavigation && (
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
};

export const Route = createRootRoute({
  component: RootComponent
});
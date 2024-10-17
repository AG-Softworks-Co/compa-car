import "./root.module.css";
import {
  AppShell,
  Center,
  createTheme,
  Group,
  MantineProvider,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { HouseIcon } from "lucide-react";
const theme = createTheme({
  fontFamily: "Inter, sans-serif",
});

export const Route = createRootRoute({
  component: () => {
    return (
      <MantineProvider theme={theme}>
        <AppShell
          styles={{
            footer: {
              borderTop: "0px solid #E6ECF1",
            },
          }}
        >
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
          <AppShell.Footer>
            <Group>
              <UnstyledButton>
                <Center>
                  <HouseIcon />
                </Center>
                <Text>Home</Text>
              </UnstyledButton>
            </Group>
          </AppShell.Footer>
        </AppShell>

        <TanStackRouterDevtools />
        <Notifications />
      </MantineProvider>
    );
  },
});

import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/spotlight/styles.css';
import '@mantine/carousel/styles.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';
import { useJsApiLoader } from '@react-google-maps/api';
import ReservarView from "./routes/publicarviaje/index";

// Import the generated route tree
import { routeTree } from './routeTree.gen';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCiXiv2UuIRHulkJtv-tUoEboxWGhnoiys';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// App component with Google Maps API loader
function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Cargando Google Maps...</div>;

  return (
    <MantineProvider>
      <RouterProvider router={router} />
      <ReservarView isLoaded={isLoaded} />
  
    </MantineProvider>
  );
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}


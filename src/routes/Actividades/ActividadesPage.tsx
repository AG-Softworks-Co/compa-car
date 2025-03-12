import { createFileRoute } from '@tanstack/react-router';
import Actividades from '../../components/Actividades/Actividades';

const ActividadesPage = () => {
    const userId = 0; // Replace with actual user ID
    const token = ""; // Replace with actual token
    return <Actividades userId={userId} token={token} />;
};

export const Route = createFileRoute('/Actividades/ActividadesPage')({
    component: ActividadesPage,
});

export default ActividadesPage;
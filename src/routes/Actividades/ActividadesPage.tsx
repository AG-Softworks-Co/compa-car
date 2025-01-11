
import { createFileRoute } from '@tanstack/react-router';
import Actividades from '../../components/Actividades/Actividades.tsx';

const ActividadesPage = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    return (
        <div>
        {userId && token ? (
            <Actividades userId={parseInt(userId, 10)} token={token} />
        ) : (
            <p>No se encontro el usuario. Inicie sesión nuevamente.</p>
        )}
        </div>
    );
};


export const Route = createFileRoute('/Actividades/ActividadesPage')({
  component: ActividadesPage,
});

export default ActividadesPage;
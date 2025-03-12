import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  LoadingOverlay,
  Card,
  Group,
  Badge,
  Divider,
} from '@mantine/core';
import { ArrowLeft, Clock3, Wallet, Lock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './index.module.css';

interface WalletData {
  balance: number;
  frozen_balance: number;
}

interface Trip {
  id: number;
  created_at: string;
  price_per_seat: number;
  seats: number;
  locations: {
    address: string;
  };
}

interface FrozenFunds {
  trip_id: number;
  amount: number;
  created_at: string;
  origin: string;
  destination: string;
}

const WalletDetailView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, frozen_balance: 0 });
  const [frozenFunds, setFrozenFunds] = useState<FrozenFunds[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: '/Login' });
          return;
        }

        // Obtener el balance de la wallet
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('balance, frozen_balance')
          .eq('user_id', session.user.id)
          .single();

        // Obtener los viajes del usuario
        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select(`
            id,
            created_at,
            price_per_seat,
            seats,
            origin:locations!trips_origin_id_fkey(address),
            destination:locations!trips_destination_id_fkey(address)
          `)
          .eq('user_id', session.user.id);

        if (walletError) throw walletError;
        if (tripsError) throw tripsError;
        if (wallet) {
          console.log('Wallet data:', wallet);
          
          setWalletData({
            balance: wallet.balance || 0,
            frozen_balance: wallet.frozen_balance || 0
          });

          // Procesar información de fondos congelados por viaje
          const tripFunds = trips?.map(trip => ({
            trip_id: trip.id,
            amount: calculateTripFrozenAmount(trip.price_per_seat ?? 0, trip.seats ?? 0),
            created_at: trip.created_at || new Date().toISOString(),
            origin: trip.origin?.address || 'Dirección no disponible',
            destination: trip.destination?.address || 'Dirección no disponible'
          })) || [];

          setFrozenFunds(tripFunds);
        }

      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Error al cargar información de la billetera');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [navigate]);

  const calculateTripFrozenAmount = (pricePerSeat: number, seats: number): number => {
    // Calcula el 15% del valor total del viaje
    const totalTripValue = pricePerSeat * seats;
    return Math.ceil(totalTripValue * 0.15);
  };

  return (
    <Container fluid className={styles.container}>
      <div className={styles.walletHeader}>
        <ArrowLeft size={24} onClick={() => navigate({ to: '/Perfil' })} className={styles.backButton} />
        <Title className={styles.walletTitle}>Detalle de Billetera</Title>
      </div>

      <Card shadow="sm" className={styles.balanceCard}>
        <Group gap="xl" className={styles.balanceGroup}>
          <div className={styles.balanceSection}>
            <Group gap="xs">
              <DollarSign size={24} />
              <Title order={3}>Saldo Disponible</Title>
            </Group>
            <Text size="xl" fw={700} className={styles.balanceAmount}>
              ${walletData.balance.toLocaleString()}
            </Text>
          </div>
          <Divider orientation="vertical" />
          <div className={styles.balanceSection}>
            <Group gap="xs">
              <Lock size={24} />
              <Title order={3}>Saldo Congelado</Title>
            </Group>
            <Text size="xl" fw={700} className={styles.frozenAmount}>
              ${walletData.frozen_balance.toLocaleString()}
            </Text>
          </div>
        </Group>
      </Card>

      <div className={styles.frozenSection}>
        <Title order={4} className={styles.sectionTitle}>
          Fondos Congelados por Viajes
        </Title>
        {frozenFunds.length > 0 ? (
          frozenFunds.map((fund) => (
            <Card key={fund.trip_id} className={styles.frozenCard}>
              <Group gap="apart">
                <div>
                  <Text fw={500}>{fund.origin} → {fund.destination}</Text>
                  <Text size="sm" color="dimmed">
                    <Clock3 size={14} className={styles.clockIcon} />
                    {new Date(fund.created_at).toLocaleDateString()}
                  </Text>
                </div>
                <Badge size="lg" variant="filled" color="blue">
                  ${fund.amount.toLocaleString()}
                </Badge>
              </Group>
            </Card>
          ))
        ) : (
          <Text color="dimmed" className={styles.noFrozenText}>
            No hay fondos congelados actualmente
          </Text>
        )}
      </div>

      {error && <Text color="red" className={styles.errorMessage}>{error}</Text>}
    </Container>
  );
};

export const Route = createFileRoute('/Wallet/')({
  component: WalletDetailView,
});

export default WalletDetailView;
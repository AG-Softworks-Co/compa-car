import { createFileRoute, useNavigate } from '@tanstack/react-router';
import styles from './index.module.css';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Group,
  Modal,
  Card,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const CuponesView = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    opened: boolean;
    success: boolean;
    message: string;
    title: string;
  }>({ opened: false, success: false, message: '', title: '' });
  const [redeemedCoupons, setRedeemedCoupons] = useState<
    { code: string; balance: number; created_at: string }[]
  >([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Ajuste para evitar carga desde arriba

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchRedeemed(uid);
    });
  }, []);

  const fetchRedeemed = async (uid: string) => {
    const { data } = await supabase
      .from('driver_giftcards')
      .select('code, balance, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (data) setRedeemedCoupons(data);
  };

  const handleRedeem = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!userId || !code) return;

    setLoading(true);

    const { data: giftcard, error: lookupError } = await supabase
      .from('code_giftcards')
      .select('*')
      .eq('code', code)
      .gt('expired_at', new Date().toISOString())
      .maybeSingle();

    if (!giftcard || lookupError) {
      setModal({
        opened: true,
        success: false,
        title: 'Código inválido o expirado',
        message: 'Este cupón no existe o ya expiró. Intenta con otro.',
      });
      setLoading(false);
      return;
    }

    const { data: alreadyUsed } = await supabase
      .from('driver_giftcards')
      .select('id')
      .eq('code', code)
      .eq('user_id', userId)
      .maybeSingle();

    if (alreadyUsed) {
      setModal({
        opened: true,
        success: false,
        title: 'Cupón ya usado',
        message: 'Este código ya fue redimido en tu cuenta.',
      });
      setLoading(false);
      return;
    }

    await supabase.from('driver_giftcards').insert({
      user_id: userId,
      code,
      balance: giftcard.value,
    });

    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();

    if (!wallet) {
      setModal({
        opened: true,
        success: false,
        title: 'Sin wallet activa',
        message: 'Tu cuenta no tiene una billetera activa. Contáctanos.',
      });
      setLoading(false);
      return;
    }

    const newBalance = Number(wallet.balance ?? 0) + Number(giftcard.value);

    await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      transaction_type: 'cupon',
      amount: giftcard.value,
      detail: `Cupón redimido (${code})`,
      status: 'completado',
    });

    setModal({
      opened: true,
      success: true,
      title: '¡Cupón redimido!',
      message: `Se acreditaron $${giftcard.value} a tu billetera.`,
    });

    setCodeInput('');
    fetchRedeemed(userId);
    setLoading(false);
  };

  return (
    <Container className={styles.container}>
      <Group className={styles.header} gap="xs">
        <Button variant="subtle" onClick={() => navigate({ to: '/Perfil' })}>
          <ArrowLeft size={20} />
        </Button>
        <Title order={3}>Redimir Cupón</Title>
      </Group>

      <TextInput
        placeholder="Ingresa tu código"
        value={codeInput}
        onChange={(e) => setCodeInput(e.currentTarget.value.toUpperCase())}
        radius="md"
        size="md"
        className={styles.input}
      />

      <Button
        className={styles.redeemButton}
        loading={loading}
        onClick={handleRedeem}
        fullWidth
        mt="md"
      >
        Aplicar Cupón
      </Button>

      <Divider my="xl" label="Cupones redimidos" labelPosition="center" />

      <ScrollArea style={{ maxHeight: '40vh' }}>
        {redeemedCoupons.length > 0 ? (
          redeemedCoupons.map((item, index) => (
            <Card key={index} shadow="xs" radius="md" withBorder mb="sm" className={styles.card}>
              <Group align="center" justify="space-between">
                <Group>
                  <CheckCircle size={20} color="#00d084" />
                  <Text>{item.code}</Text>
                </Group>
                <Text fw={700}>+${item.balance.toLocaleString()}</Text>
              </Group>
              <Text size="xs" color="dimmed">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </Card>
          ))
        ) : (
          <Text color="dimmed" size="sm">
            Aún no has redimido ningún cupón.
          </Text>
        )}
      </ScrollArea>

      <Modal
        opened={modal.opened}
        onClose={() => setModal({ ...modal, opened: false })}
        centered
        size="sm"
        withCloseButton={false}
      >
        <Group align="center" justify="center" mb="md">
          {modal.success ? (
            <CheckCircle size={48} color="#00d084" />
          ) : (
            <XCircle size={48} color="#e03131" />
          )}
        </Group>
        <Title order={4} style={{ textAlign: 'center' }} mb="xs">
          {modal.title}
        </Title>
        <Text style={{ textAlign: 'center' }} mb="md">
          {modal.message}
        </Text>
        <Button fullWidth onClick={() => setModal({ ...modal, opened: false })}>
          Aceptar
        </Button>
      </Modal>
    </Container>
  );
};

export const Route = createFileRoute('/Cupones/')({
  component: CuponesView,
});

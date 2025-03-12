import React, { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Container,
  Title,
  Text,
  Card,
  Button,
  Group,
  RadioGroup,
  Radio,
  Image,
  LoadingOverlay,
  TextInput,
  NumberInput,
} from '@mantine/core'
import { ArrowLeft, CreditCard, Wallet, Smartphone } from 'lucide-react'
import styles from './index.module.css'
import { supabase } from '@/lib/supabaseClient';
import { notifications } from '@mantine/notifications';

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api'

// Modificar la definición de los métodos de pago para usar valores válidos
const paymentMethods = [
  {
    id: 'CARD',  // Cambiado de 'debit-card' a 'CARD'
    name: 'Usa tus Tarjetas',
    icon: <CreditCard size={24} />,
    image: '/visa.png',
    description: 'Realiza pagos con tus tarjetas de crédito o débito.',
  },
  {
    id: 'BANCOLOMBIA',  // Cambiado de 'bank-transfer' a 'BANCOLOMBIA'
    name: 'Transfiere con cuenta Bancolombia',
    icon: <Wallet size={24} />,
    image: '/bancolombia.png',
    description: 'Transfiere desde tu cuenta Bancolombia.',
  },
  {
    id: 'NEQUI',  // Cambiado de 'nequi' a 'NEQUI'
    name: 'Usa tu cuenta Nequi',
    icon: <Smartphone size={24} />,
    image: '/nequi.png',
    description: 'Realiza pagos con tu cuenta Nequi.',
  },
  {
    id: 'PSE',  // Cambiado de 'account-payment' a 'PSE'
    name: 'Usa tu cuenta de ahorros o corriente',
    icon: <Wallet size={24} />,
    image: '/pse.png',
    description: 'Paga desde tu cuenta bancaria directamente.',
  },
]

const GatewayView: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  const handleGoBack = () => {
    navigate({ to: '/Perfil' })
  }

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  const validateAmount = (value: number): string | null => {
    if (value < 10000) return 'El monto mínimo de recarga es $10,000';
    if (value > 1000000) return 'El monto máximo de recarga es $1,000,000';
    return null;
  };

  const createPaymentGateway = async (userId: string, amount: number, method: string) => {
    try {
        // Validar que el método de pago sea uno de los permitidos
        const validMethods = ['CARD', 'BANCOLOMBIA', 'NEQUI', 'PSE'];
        if (!validMethods.includes(method)) {
            throw new Error('Método de pago no válido');
        }

        // Crear el registro del gateway
        const { data: gateway, error } = await supabase
            .from('payment_gateways')
            .insert({
                user_id: userId,
                amount,
                payment_method: method,
                provider: 'WOMPI', // Asegurarnos de usar un valor válido
                reference: `PAY-${Date.now()}`,
                status: 'PENDING',
                transaction_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Payment gateway error details:', error);
            throw error;
        }

        console.log('Payment gateway created:', gateway);
        return gateway;
    } catch (error) {
        console.error('Error creating payment gateway:', error);
        throw error;
    }
};

  const createWalletTransaction = async (userId: string, amount: number, gatewayId: number) => {
    try {
        const { data: existingWallet, error: walletQueryError } = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (walletQueryError) throw walletQueryError;

        let walletId;
        if (!existingWallet) {
            const { data: newWallet, error: createError } = await supabase
                .from('wallets')
                .insert([{
                    user_id: userId,
                    balance: 0,
                    frozen_balance: 0
                }])
                .select()
                .single();

            if (createError) throw createError;
            walletId = newWallet.id;
        } else {
            walletId = existingWallet.id;
        }

        // Cambiar 'CREDIT' por 'recarga' para coincidir con la restricción
        const { data: transaction, error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert([{
                wallet_id: walletId,
                amount: amount,
                transaction_type: 'recarga', // Cambiado de 'CREDIT' a 'recarga'
                payment_gateway_id: gatewayId,
                status: 'PENDING',
                detail: 'Recarga de billetera',
                transaction_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (transactionError) throw transactionError;
        return transaction;
    } catch (error) {
        console.error('Error in createWalletTransaction:', error);
        throw error;
    }
};

  const handleSubmit = async () => {
    const amountError = validateAmount(amount);
    if (amountError) {
      notifications.show({
        title: 'Error',
        message: amountError,
        color: 'red'
      });
      return;
    }

    if (!selectedPaymentMethod) {
      notifications.show({
        title: 'Error',
        message: 'Seleccione un método de pago',
        color: 'red'
      });
      return;
    }

    try {
      setProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        navigate({ to: '/Login' });
        return;
      }

      // 1. Crear registro en payment_gateways
      const gateway = await createPaymentGateway(
        session.user.id,
        amount,
        selectedPaymentMethod
      );

      // 2. Crear transacción en wallet_transactions
      await createWalletTransaction(
        session.user.id,
        amount,
        gateway.id
      );

      // 3. Redirigir a la pasarela de pago (simulado aquí)
      notifications.show({
        title: 'Procesando pago',
        message: 'Redirigiendo a la pasarela de pago...',
        color: 'blue',
        loading: true
      });

      // Aquí iría la redirección a la pasarela real
      setTimeout(() => {
        navigate({ to: '/Wallet' });
      }, 2000);

    } catch (error: any) {
      console.error('Error processing payment:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al procesar el pago',
        color: 'red'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className={styles.paymentContainer}>
        <LoadingOverlay visible />
      </Container>
    )
  }

  return (
    <Container fluid className={styles.paymentContainer}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
        <ArrowLeft size={24} onClick={handleGoBack} style={{ cursor: 'pointer' }} />
        <Title order={2} style={{ margin: 0 }}>Recargar Billetera</Title>
      </div>
      <Card shadow="sm" className={styles.paymentCard}>
        <Title order={3} mb="xl">Recargar Billetera</Title>

        <NumberInput
          label="Monto a recargar"
          description="Mínimo $10,000 - Máximo $1,000,000"
          value={amount}
          onChange={(val) => setAmount(Number(val))}
          min={10000}
          max={1000000}
          step={10000}
          prefix="$ "
          thousandSeparator=","
          className={styles.amountInput}
        />

        <Title order={4} mt="xl" mb="md">Método de pago</Title>
        <RadioGroup value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
          {paymentMethods.map((method) => (
            <Card key={method.id} shadow="sm" className={styles.tripSummary}>
              <Radio value={method.id} label={
                <Group gap="apart">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 157, 0.1)' }}>
                      {method.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text fw={500}>{method.name}</Text>
                      <Text size='sm' color="dimmed">{method.description}</Text>
                    </div>
                  </div>
                  <div style={{ width: 60, height: 40 }}>
                    <Image
                      fit="contain"
                      src={method.image}
                      alt={method.name}
                      fw={50}
                    />
                  </div>
                </Group>
              } />
            </Card>
          ))}
        </RadioGroup>

        <Button
          fullWidth
          className={styles.confirmButton}
          mt="xl"
          onClick={handleSubmit}
          loading={processing}
          disabled={!amount || !selectedPaymentMethod}
        >
          {processing ? 'Procesando...' : 'Confirmar Recarga'}
        </Button>
      </Card>
    </Container>
  )
}

export const Route = createFileRoute('/Gateway/')({
  component: GatewayView,
})

export default GatewayView
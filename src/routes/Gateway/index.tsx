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
} from '@mantine/core'
import { ArrowLeft, CreditCard,  Wallet, Smartphone } from 'lucide-react'
import styles from './index.module.css'

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api'

const paymentMethods = [
  {
    id: 'debit-card',
    name: 'Usa tus Tarjetas',
    icon: <CreditCard size={24} />,
    image: '/visa.png',
    description: 'Realiza pagos con tus tarjetas de crédito o débito.',
  },
    {
    id: 'bank-transfer',
    name: 'Transfiere con cuenta Bancolombia',
     icon: <Wallet size={24} />,
     image: '/bancolombia.png',
        description: 'Transfiere desde tu cuenta Bancolombia.',
  },
 
    {
        id: 'nequi',
        name: 'Usa tu cuenta Nequi',
         icon: <Smartphone size={24} />,
           image: '/nequi.png',
            description: 'Realiza pagos con tu cuenta Nequi.',
    },
  {
    id: 'account-payment',
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
    const handleGoBack = () => {
        navigate({ to: '/Perfil' })
    }
      const handlePaymentMethodChange = (value: string) => {
            setSelectedPaymentMethod(value);
         };
    const handleSubmit = async () => {
            if(!selectedPaymentMethod){
                return alert('Seleccione un método de pago');
            }

           try {
             setLoading(true);
           const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

        if (!token || !userId) {
           console.log('No hay sesión activa, redirigiendo...')
          navigate({ to: '/Login' })
           return
         }

            // Configura la solicitud con los datos necesarios
           const requestBody = {
                 user_id: userId,
               payment_method: selectedPaymentMethod,
              amount: 3500,
            };
            // Realiza la llamada a la API para generar el link de pago
          const response = await fetch(`${BASE_URL}/payment`, {
           method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            'x-token': token,
             },
             body: JSON.stringify(requestBody),
           });
        // Maneja la respuesta de la API
        if (!response.ok) {
               const errorData = await response.json();
                console.error('Error al procesar el pago:', errorData);
             throw new Error('Error al procesar el pago');
            }

          const responseData = await response.json();
            // Redirecciona al link de pago
          if (responseData.ok && responseData.data?.payment_url) {
                window.location.href = responseData.data.payment_url;
            } else {
                throw new Error('No se pudo obtener el link de pago');
             }
        } catch (error) {
          console.error('Error en el proceso de pago:', error);
            alert('Error al procesar el pago');
       } finally {
            setLoading(false);
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
          <div style={{display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20}}>
                <ArrowLeft size={24} onClick={handleGoBack} style={{cursor: 'pointer'}}/>
                <Title order={2} style={{margin: 0}}>Recargar Billetera</Title>
            </div>
      <Card shadow="sm" className={styles.paymentCard}>
           <Title order={3} style={{marginBottom: 20}}>
            Escoge un método de pago
           </Title>
          <RadioGroup value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
            {paymentMethods.map((method) => (
              <Card key={method.id} shadow="sm" className={styles.tripSummary}>
                <Radio value={method.id} label={
                  <Group gap="apart">
                      <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
                            <div style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 157, 0.1)'}}>
                              {method.icon}
                              </div>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                              <Text fw={500}>{method.name}</Text>
                               <Text size='sm' color="dimmed">{method.description}</Text>
                          </div>
                     </div>
                       <div style={{width: 60, height: 40}}>
                        <Image
                            fit="contain"
                            src={method.image}
                            alt={method.name}
                            fw={50}
                           />
                       </div>
                   </Group>
                  }/>
                </Card>
            ))}
          </RadioGroup>
           <Button
             fullWidth
              className={styles.confirmButton}
              mt="xl"
              onClick={handleSubmit}
           >
             Confirmar Recarga
            </Button>
      </Card>
    </Container>
  )
}

export const Route = createFileRoute('/Gateway/')({
  component: GatewayView,
})

export default GatewayView
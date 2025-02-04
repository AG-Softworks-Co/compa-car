import React, { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Container,
  Title,
  Text,
  LoadingOverlay,
  Card,
  Group,
} from '@mantine/core'
import { ArrowLeft, Clock3, Wallet } from 'lucide-react'
import styles from './index.module.css'

interface Transaction {
  id: number
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api'

const WalletDetailView: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const userId = localStorage.getItem('userId')

        if (!token || !userId) {
          console.log('No hay sesión activa, redirigiendo...')
          navigate({ to: '/Login' })
          return
        }

        // Fetch Balance
        const balanceResponse = await fetch(
          `${BASE_URL}/wallets/balance/${userId}`,
          {
            headers: { 'x-token': token },
          },
        )
        if (!balanceResponse.ok) {
          throw new Error('Error fetching balance')
        }
        const balanceData = await balanceResponse.json()
        if (balanceData.ok) {
          setBalance(balanceData.data.balance)
        }

        // Fetch Transactions
        const transactionsResponse = await fetch(
          `${BASE_URL}/transactions/wallet/${userId}`,
          {
            headers: { 'x-token': token },
          },
        )
        if (!transactionsResponse.ok) {
          throw new Error('Error fetching transactions')
        }
        const transactionsData = await transactionsResponse.json()
          if (transactionsData.ok) {
           setTransactions(transactionsData.data);
          }
      } catch (err: any) {
        console.error('Error fetching wallet data:', err)
        setError('Error al cargar información de la billetera')
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [navigate])

  const handleGoBack = () => {
    navigate({ to: '/Perfil' })
  }

  if (loading) {
    return (
      <Container fluid className={styles.container}>
        <LoadingOverlay visible />
      </Container>
    )
  }

  return (
    <Container fluid className={styles.container}>
      <div className={styles.walletHeader}>
        <ArrowLeft size={24} onClick={handleGoBack} style={{cursor: 'pointer'}}/>
        <Title className={styles.walletTitle}>Detalle de Billetera</Title>
      </div>

      <Card shadow="sm" className={styles.balanceCard}>
        <Group gap="apart" >
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Wallet size={24} />
            <Title order={3} className={styles.balanceLabel}>Saldo Actual</Title>
          </div>
           <Text fw={700} size="lg" className={styles.balanceAmount}>
          ${balance.toFixed(2)}
        </Text>
        </Group>
      </Card>

      <div className={styles.transactionsSection}>
        <Title order={4} className={styles.transactionsTitle}>
          Historial de Transacciones
        </Title>
          {transactions.length > 0 ? (
               transactions.map((transaction) => (
              <Card key={transaction.id} shadow="sm" className={styles.transactionCard}>
                <Group gap="apart">
                  <div>
                    <Text fw={500} className={styles.transactionDescription}>{transaction.description}</Text>
                    <Text size="sm" color="dimmed">
                      <Clock3 size={14} style={{verticalAlign: 'middle', marginRight: 4}}/>
                      {new Date(transaction.date).toLocaleString()}
                    </Text>
                  </div>
                  <Text
                  fw={600}
                  className={`${styles.transactionAmount} ${
                    transaction.type === 'credit'
                      ? styles.creditTransaction
                      : styles.debitTransaction
                  }`}
                  >
                     {transaction.type === 'credit' ? '+' : '-'} ${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </Group>
              </Card>
            ))
          ) : (
            <Text color="dimmed" className={styles.noTransactionsText}>
              No hay transacciones registradas.
            </Text>
          )}
      </div>
      {error && <Text color="red" className={styles.errorMessage}>{error}</Text>}
    </Container>
  )
}

export const Route = createFileRoute('/Wallet/')({
  component: WalletDetailView,
})

export default WalletDetailView
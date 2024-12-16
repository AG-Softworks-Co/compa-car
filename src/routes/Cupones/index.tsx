import { createFileRoute, useNavigate } from '@tanstack/react-router'
import styles from './index.module.css'
import React, { useState } from 'react';
import { Container, Title, Text, Button, Badge, Tabs, Modal } from '@mantine/core';
import { Gift, Clock, Search, Copy, Check, ArrowLeft } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { LucideIcon } from 'lucide-react';

interface Coupon {
  id: number;
  category: string;
  discount: string;
  title: string;
  description: string;
  code: string;
  validUntil: string;
  validFrom?: string;
  maxDiscount: string;
  minAmount?: string;
  usageLimit: string;
  icon: LucideIcon;
  conditions: string[];
  isComingSoon?: boolean;
}

const CuponesView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponibles' },
    { value: 'soon', label: 'Próximamente' },
    { value: 'used', label: 'Utilizados' }
  ];

  const coupons: Coupon[] = [
    {
      id: 1,
      category: 'available',
      discount: '50%',
      title: '¡50% en tu próximo viaje!',
      description: 'Aprovecha este descuento especial',
      code: 'RIDE50DIC',
      validUntil: '2024-12-31',
      maxDiscount: '$100',
      minAmount: '$200',
      usageLimit: '1 vez por usuario',
      icon: Gift,
      conditions: [
        'Válido solo para viajes de más de $200',
        'No acumulable con otras promociones',
        'Válido hasta el 31 de diciembre de 2024'
      ]
    },
    {
      id: 2,
      category: 'soon',
      discount: '$200',
      title: 'Descuento Navideño',
      description: 'Celebra la navidad con este regalo',
      code: 'XMAS200',
      validFrom: '2024-12-20',
      validUntil: '2024-12-25',
      maxDiscount: '$200',
      usageLimit: '1 vez por usuario',
      icon: Gift,
      isComingSoon: true,
      conditions: [
        'Válido del 20 al 25 de diciembre',
        'Para viajes superiores a $400',
        'Solo usuarios Premium'
      ]
    }
  ];

  const filteredCoupons = coupons.filter(coupon => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return !coupon.isComingSoon;
    if (activeTab === 'soon') return coupon.isComingSoon;
    return false;
  }).filter(coupon => {
    if (!searchValue) return true;
    return coupon.code.toLowerCase().includes(searchValue.toLowerCase()) ||
           coupon.title.toLowerCase().includes(searchValue.toLowerCase());
  });

  const handleCopyCode = async (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      notifications.show({
        title: '¡Código copiado!',
        message: 'Úsalo en tu próximo viaje',
        color: 'green'
      });
      setTimeout(() => setCopiedCode(''), 3000);
    } catch (err) {
      notifications.show({
        title: 'Error al copiar',
        message: 'No se pudo copiar el código',
        color: 'red'
      });
    }
  };

  const handleBack = () => {
    navigate({ to: '/perfil' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic is already handled by filteredCoupons
    setSearchVisible(false);
  };

  return (
    <Container fluid className={styles.paymentContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            variant="subtle" 
            className={styles.backButton}
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </Button>
          <Title order={2} className={styles.title}>Cupones</Title>
        </div>
        <Button 
          variant="subtle" 
          className={styles.searchButton}
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search size={20} />
        </Button>
      </div>

      {searchVisible && (
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Ingresa el código del cupón"
            className={styles.searchInput}
          />
          <Button type="submit" className={styles.applyButton}>
            Aplicar
          </Button>
        </form>
      )}

      <Tabs 
        value={activeTab} 
        onChange={(value) => setActiveTab(value || 'all')} 
        className={styles.tabs}
      >
        <Tabs.List>
          {categories.map(cat => (
            <Tabs.Tab 
              key={cat.value} 
              value={cat.value}
              className={styles.tab}
            >
              {cat.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value={activeTab} className={styles.tabPanel}>
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => (
              <div 
                key={coupon.id} 
                className={`${styles.couponCard} ${coupon.isComingSoon ? styles.comingSoon : ''}`}
                onClick={() => setSelectedCoupon(coupon)}
              >
                <div className={styles.couponHeader}>
                  <coupon.icon size={24} className={styles.couponIcon} />
                  <Badge className={styles.discountBadge}>
                    {coupon.discount}
                  </Badge>
                </div>

                <Text className={styles.couponTitle}>{coupon.title}</Text>
                <Text className={styles.couponDescription}>{coupon.description}</Text>

                {coupon.isComingSoon ? (
                  <div className={styles.comingSoonLabel}>
                    <Clock size={16} />
                    <Text>Disponible {new Date(coupon.validFrom!).toLocaleDateString()}</Text>
                  </div>
                ) : (
                  <button 
                    className={styles.copyButton}
                    onClick={(e) => handleCopyCode(coupon.code, e)}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check size={16} />
                        <Text>¡Copiado!</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <Text>{coupon.code}</Text>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            <Text className={styles.noResults}>
              No se encontraron cupones
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={!!selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
        title={null}
        className={styles.couponModal}
        size="lg"
      >
        {selectedCoupon && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <selectedCoupon.icon size={40} className={styles.modalIcon} />
              <Badge size="lg" className={styles.modalBadge}>
                {selectedCoupon.discount}
              </Badge>
            </div>
            
            <Title order={3} className={styles.modalTitle}>
              {selectedCoupon.title}
            </Title>
            
            <div className={styles.modalDetails}>
              <div className={styles.detailItem}>
                <Text fw={500}>Código:</Text>
                <div className={styles.codeContainer}>
                  <Text className={styles.code}>{selectedCoupon.code}</Text>
                  <Button
                    variant="subtle"
                    onClick={() => handleCopyCode(selectedCoupon.code)}
                    className={styles.copyCodeButton}
                  >
                    {copiedCode === selectedCoupon.code ? <Check /> : <Copy />}
                  </Button>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <Text fw={500}>Válido hasta:</Text>
                <Text>{new Date(selectedCoupon.validUntil).toLocaleDateString()}</Text>
              </div>
              
              {selectedCoupon.minAmount && (
                <div className={styles.detailItem}>
                  <Text fw={500}>Monto mínimo:</Text>
                  <Text>{selectedCoupon.minAmount}</Text>
                </div>
              )}
              
              <div className={styles.detailItem}>
                <Text fw={500}>Descuento máximo:</Text>
                <Text>{selectedCoupon.maxDiscount}</Text>
              </div>
              
              <div className={styles.detailItem}>
                <Text fw={500}>Límite de uso:</Text>
                <Text>{selectedCoupon.usageLimit}</Text>
              </div>
            </div>

            <div className={styles.conditions}>
              <Text fw={500} mb="sm">Términos y condiciones:</Text>
              {selectedCoupon.conditions.map((condition, index) => (
                <Text key={index} size="sm" className={styles.condition}>
                  • {condition}
                </Text>
              ))}
            </div>

            <Button 
              fullWidth 
              className={styles.useButton}
              onClick={() => setSelectedCoupon(null)}
            >
              Usar ahora
            </Button>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export const Route = createFileRoute('/Cupones/')({
  component: CuponesView
});
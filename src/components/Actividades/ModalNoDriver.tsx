import type React from 'react';
import { Modal, Container, Title, Text, } from '@mantine/core';
import { AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import styles from './SrylesComponents/ModalNoDrIver.module.css';

interface ModalNoDriverProps {
  onClose: () => void;
}

const ModalNoDriver: React.FC<ModalNoDriverProps> = ({ onClose }) => {
  return (
    <Modal
      opened={true}
      onClose={onClose}
      centered
      size="md"
      classNames={{ root: styles.modal }}
      withCloseButton={false}
    >
      <Container size="xs" className={styles.container}>
        {/* Header con ícono y título alineados */}
        <div className={styles.header}>
          <ShieldAlert size={36} color="#00ff9d" />
          <Title order={3} className={styles.title}>
            Acceso Restringido
          </Title>
        </div>

        <div className={styles.content}>
          {/* Ícono de alerta y texto */}
          <div className={styles.groupIcon}>
            <AlertCircle size={24} color="#00ff9d" />
            <Text className={styles.description}>
              No tienes viajes publicados porque aún no eres un conductor verificado. Para comenzar a publicar viajes, completa los siguientes pasos:
            </Text>
          </div>

          {/* Lista de pasos */}
          <ul className={styles.list}>
            <li>Sube tu licencia de conducir válida.</li>
            <li>Verifica tu identidad.</li>
            <li>Completa la información de tu vehículo.</li>
          </ul>
        </div>

        {/* Botón centrado */}
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={onClose}>
            Entendido
            <ArrowRight size={18} />
          </button>
        </div>
      </Container>
    </Modal>
  );
};

export default ModalNoDriver;

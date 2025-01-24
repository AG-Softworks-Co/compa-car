import type React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import styles from './SrylesComponents/DeleteTripModal.module.css';

interface DeleteTripModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteTripModal: React.FC<DeleteTripModalProps> = ({ opened, onClose, onDelete }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      overlayProps={{
        opacity: 0.5,
        blur: 3,
      }}
      classNames={{
        content: styles.modal,
      }}
      title={
        <Text className={styles.title}>Confirmar Eliminación</Text>
      }
    >
      <div className={styles.content}>
        <Text className={styles.description}>
          <span>¿</span>Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer<span>?</span>
        </Text>
      </div>

      <Group className={styles.buttonGroup}>
        <Button className={styles.deleteButton} onClick={onDelete}>
          Sí, eliminar
        </Button>
        <Button className={styles.cancelButton} onClick={onClose}>
          Cancelar
        </Button>
      </Group>
    </Modal>
  );
};

export default DeleteTripModal;

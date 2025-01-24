import type React from 'react';
import { Modal, Stack, Textarea, NumberInput, Switch, Button } from '@mantine/core';
import type { Trip } from './Actividades';

interface EditTripModalProps {
    opened: boolean;
    onClose: () => void;
    editedTrip: Trip | null;
    onEditSubmit: () => void;
    onEditedTripChange: (newEditedTrip: Trip) => void;
}


const EditTripModal: React.FC<EditTripModalProps> = ({ opened, onClose, editedTrip, onEditSubmit, onEditedTripChange }) => {
  return (
    <Modal
        opened={opened}
        onClose={onClose}
        title="Editar Viaje"
        centered
      >
        {editedTrip && (
        <Stack gap="md">
          <Textarea
            label="Descripción"
            value={editedTrip.description}
            onChange={(e) => onEditedTripChange({ ...editedTrip, description: e.target.value })}
          />
          <NumberInput
            label="Precio por Asiento (COP)"
            value={editedTrip.pricePerSeat}
            onChange={(value) => onEditedTripChange({ ...editedTrip, pricePerSeat: Number(value) })}
            min={0}
          />
          <Switch
            label="Permitir Mascotas"
            checked={editedTrip.allowPets}
            onChange={(e) => onEditedTripChange({ ...editedTrip, allowPets: e.currentTarget.checked })}
          />
          <Switch
            label="Permitir Fumar"
            checked={editedTrip.allowSmoking}
            onChange={(e) => onEditedTripChange({ ...editedTrip, allowSmoking: e.currentTarget.checked })}
          />
          <Button color="green" onClick={onEditSubmit}>
            Guardar Cambios
          </Button>
        </Stack>
      )}
    </Modal>
  );
};

export default EditTripModal;
import React, { useState, useEffect } from 'react';
import ModalNoDriver from './ModalNoDriver';
import { Button, Group } from '@mantine/core';
import styles from './SrylesComponents/RolSelector.module.css'

interface RolSelectorProps {
    userId: number | null;
    token: string | null;
    onSelect: (option: string) => void;
    role: string | null;
}

const RolSelector: React.FC<RolSelectorProps> = ({ userId, token, onSelect, role }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);


  useEffect(() => {
    if(role){
     console.log("User role in RolSelector:", role);
    }
   }, [role]);


  const handleOptionSelect = (option: string) => {
    if (role === 'PASSENGER' && option === 'Viajes Publicados') {
        setShowModal(true);
        return;
    }
    if (role === 'PASSENGER' && option === "Cupos Creados") {
      onSelect(option);
        return;
    }
    setSelectedOption(option);
    onSelect(option);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Group gap="md"  mt="md">
       <Button 
            onClick={() => handleOptionSelect('Cupos Creados')}
            className={`${styles.button} ${selectedOption === 'Cupos Creados' ? styles.selected : ''}`}
        >
            Cupos Creados
        </Button>
        <Button 
            onClick={() => handleOptionSelect('Viajes Publicados')}
            className={`${styles.button} ${selectedOption === 'Viajes Publicados' ? styles.selected : ''}`}
        >
            Viajes Publicados
        </Button>
        {showModal && <ModalNoDriver onClose={handleCloseModal} />}
    </Group>
  );
};

export default RolSelector;
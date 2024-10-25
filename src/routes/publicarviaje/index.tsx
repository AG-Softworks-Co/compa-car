import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  TextInput,
  Button,
  Stepper,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { 

  MapPin, 
  ArrowLeft, 
  Calendar, 
  Clock,
  Users,
  Car,
  CircleDollarSign
} from 'lucide-react';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import styles from './index.module.css';

const PublicarViajeView = () => {
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: 1,
    price: ''
  });

  const nextStep = () => setActive((current) => current + 1);
  const prevStep = () => setActive((current) => current - 1);

  return (
    <Container fluid className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <UnstyledButton 
          component={Link} 
          to="/" 
          className={styles.backButton}
        >
          <ArrowLeft size={24} />
        </UnstyledButton>
        <Title className={styles.headerTitle}>Publicar viaje</Title>
      </div>

      <Container size="sm" className={styles.content}>
        <Stepper 
          active={active} 
          onStepClick={setActive}
          classNames={{
            root: styles.stepper,
            step: styles.step,
            stepIcon: styles.stepIcon,
            stepCompletedIcon: styles.stepCompletedIcon,
            separator: styles.separator
          }}
        >
          <Stepper.Step
            label="Ruta"
            description="¿A dónde vas?"
          >
            <div className={styles.stepContent}>
              <Title className={styles.stepTitle}>¿Desde dónde sales?</Title>
              <div className={styles.searchBox}>
                <MapPin className={styles.searchIcon} size={20} />
                <TextInput
                  placeholder="Escribe la dirección completa"
                  className={styles.input}
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>

              <Title className={styles.stepTitle}>¿A dónde vas?</Title>
              <div className={styles.searchBox}>
                <MapPin className={styles.searchIcon} size={20} />
                <TextInput
                  placeholder="Escribe la dirección completa"
                  className={styles.input}
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Step
            label="Detalles"
            description="Fecha y hora"
          >
            <div className={styles.stepContent}>
              <Title className={styles.stepTitle}>¿Cuándo viajas?</Title>
              <div className={styles.searchBox}>
                <Calendar className={styles.searchIcon} size={20} />
                <TextInput
                  placeholder="Selecciona la fecha"
                  className={styles.input}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <Title className={styles.stepTitle}>¿A qué hora sales?</Title>
              <div className={styles.searchBox}>
                <Clock className={styles.searchIcon} size={20} />
                <TextInput
                  placeholder="Selecciona la hora"
                  className={styles.input}
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Step
            label="Precio"
            description="Configura tu viaje"
          >
            <div className={styles.stepContent}>
              <Title className={styles.stepTitle}>Detalles del viaje</Title>
              
              <Text className={styles.inputLabel}>Asientos disponibles</Text>
              <div className={styles.searchBox}>
                <Users className={styles.searchIcon} size={20} />
                <TextInput
                  type="number"
                  min={1}
                  max={4}
                  placeholder="¿Cuántos pasajeros?"
                  className={styles.input}
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: Number(e.target.value)})}
                />
              </div>

              <Text className={styles.inputLabel}>Precio por asiento</Text>
              <div className={styles.searchBox}>
                <CircleDollarSign className={styles.searchIcon} size={20} />
                <TextInput
                  placeholder="Precio en COP"
                  className={styles.input}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Completed>
            <div className={styles.completedStep}>
              <Car size={64} className={styles.completedIcon} />
              <Title className={styles.completedTitle}>¡Todo listo!</Title>
              <Text className={styles.completedText}>
                Tu viaje está listo para ser publicado
              </Text>
            </div>
          </Stepper.Completed>
        </Stepper>

        <div className={styles.navigationButtons}>
          {active > 0 && (
            <Button
              variant="default"
              onClick={prevStep}
              className={styles.prevButton}
            >
              Atrás
            </Button>
          )}
          {active < 3 && (
            <Button
              onClick={nextStep}
              className={styles.nextButton}
            >
              Continuar
            </Button>
          )}
          {active === 3 && (
            <Button
              className={styles.publishButton}
              onClick={() => console.log('Publicar viaje:', formData)}
            >
              Publicar viaje
            </Button>
          )}
        </div>
      </Container>
    </Container>
  );
};

export const Route = createFileRoute('/publicarviaje/')({
  component: PublicarViajeView
});
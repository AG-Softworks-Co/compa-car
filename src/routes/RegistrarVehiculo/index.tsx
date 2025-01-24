import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Camera, 
  AlertCircle,
   FileText,
    Calendar,
     Shield,
} from 'lucide-react';
import {
  Container,
  LoadingOverlay,
  Paper,
  Group,
  TextInput,
  Select,
  Button,
  Text,
  Box,
  UnstyledButton,
} from '@mantine/core';
import styles from './index.module.css';

interface VehicleFormData {
  id?: number;
  user_id: number;
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
  body_type: string;
  engine_number: string;
  chassis_number: string;
  vin_number: string;
  photo?: File | null;
  photoUrl?: string | null;
}

interface ValidationErrors {
  [key: string]: string;
}

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const COLORS = [
  { value: 'Blanco', label: 'Blanco' },
  { value: 'Negro', label: 'Negro' },
  { value: 'Gris', label: 'Gris' },
  { value: 'Rojo', label: 'Rojo' },
  { value: 'Azul', label: 'Azul' },
  { value: 'Verde', label: 'Verde' },
  { value: 'Amarillo', label: 'Amarillo' },
  { value: 'Plata', label: 'Plata' },
];

const BODY_TYPES = [
  { value: 'Automovil', label: 'Automóvil' },
  { value: 'Camioneta', label: 'Camioneta' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Van', label: 'Van' },
  { value: 'Pickup', label: 'Pick-up' },
];

const YEARS = Array.from(
  { length: 25 },
  (_, i) => {
    const year = (new Date().getFullYear() - i).toString();
    return { value: year, label: year };
  }
);

const VehicleRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState(true); // Por defecto en modo visualización
  const [hasVehicle, setHasVehicle] = useState(false);

  const [formData, setFormData] = useState<VehicleFormData>({
    user_id: 0,
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    body_type: '',
    engine_number: '',
    chassis_number: '',
    vin_number: '',
    photo: null,
    photoUrl: null
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        console.log('Iniciando carga de datos del vehículo...');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          console.log('No hay token o userId. Redirigiendo a login...');
          navigate({ to: '/Login' });
          return;
        }

        console.log('Token y userId encontrados. UserId:', userId);

        setFormData(prev => ({
          ...prev,
          user_id: Number.parseInt(userId)
        }));

        const response = await fetch(`${BASE_URL}/vehicles`, {
          headers: {
            'x-token': token
          }
        });

        console.log('Respuesta del servidor status:', response.status);

        if (!response.ok) {
          throw new Error('Error al obtener los datos del vehículo');
        }

        const data = await response.json();
        console.log('Datos recibidos del servidor:', data);

        // Filtrar vehículos por el user_id
        const userVehicles = data.data.filter((vehicle: any) => vehicle.user_id.toString() === userId);

        if (userVehicles.length > 0) {
          console.log('Vehículo encontrado:', userVehicles[0]);
          const vehicle = userVehicles[0];
          setHasVehicle(true);
          setFormData(prev => ({
            ...prev,
            ...vehicle,
            photoUrl: vehicle.photo || null,
            year: vehicle.year?.toString() || '',
            id: vehicle.id
          }));
          setViewMode(false);
        } else {
          console.log('No se encontraron vehículos para este usuario');
          setHasVehicle(false);
          setViewMode(false); // Permitir registro si no hay vehículo
        }
      } catch (error) {
        console.error('Error durante la carga de datos:', error);
        setError("Error al cargar la información del vehículo");
       setViewMode(false);
      } finally {
        setInitialLoading(false);
      }
    };

    loadVehicleData();
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.brand.trim()) newErrors.brand = 'La marca es requerida';
    if (!formData.model.trim()) newErrors.model = 'El modelo es requerido';
    if (!formData.year) newErrors.year = 'El año es requerido';
    if (!formData.plate.trim()) newErrors.plate = 'La placa es requerida';
    if (!formData.color) newErrors.color = 'El color es requerido';
    if (!formData.body_type) newErrors.body_type = 'El tipo de vehículo es requerido';
    if (!formData.engine_number.trim()) newErrors.engine_number = 'El número de motor es requerido';
    if (!formData.chassis_number.trim()) newErrors.chassis_number = 'El número de chasis es requerido';
    if (!formData.vin_number.trim()) newErrors.vin_number = 'El número VIN es requerido';
    if (!hasVehicle && !formData.photo && !formData.photoUrl) {
      newErrors.photo = 'La foto del vehículo es requerida';
    }

    const plateRegex = /^[A-Z]{3}\d{3}$/;
    if (!plateRegex.test(formData.plate.toUpperCase())) {
      newErrors.plate = 'Formato de placa inválido (ejemplo: ABC123)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    if (viewMode) return; // No permitir cambios en modo visualización
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (viewMode) return; // No permitir cambios en modo visualización

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

 const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Por favor, complete todos los campos requeridos correctamente");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate({ to: '/Login' });
        return;
      }

      const formDataToSend = new FormData();
         Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'photoUrl' && value !== null) {
              formDataToSend.append(key, String(value).trim());
          }
       });

      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      console.log('Enviando datos al servidor:', Object.fromEntries(formDataToSend));
        const method = hasVehicle ? 'PUT' : 'POST';
      const url = hasVehicle
          ? `${BASE_URL}/vehicles/${formData.id}`
          : `${BASE_URL}/vehicles`;

      console.log('Método HTTP:', method);
      console.log('URL de la petición:', url);


      const response = await fetch(url, {
        method,
        headers: {
          'x-token': token
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.msg || 'Error al procesar el vehículo');
      }

      navigate({ to: '/Perfil' });
    } catch (error: any) {
      console.error('Error al procesar el vehículo:', error);
      setError(error.message || "Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/Perfil' });
  };


  if (initialLoading) {
    return (
      <Container className={styles.container}>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
         <div className={styles.gradientBackground} />
      <LoadingOverlay visible={loading} />

      <Group justify="flex-start" mb="xl">
        <UnstyledButton onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </UnstyledButton>
      </Group>

      <Paper className={styles.formWrapper}>
        <Box className={styles.header}>
          <Group gap="apart" align="center">
            <Text className={styles.title}>
              {hasVehicle ? 'Información del Vehículo' : 'Registrar Vehículo'}
            </Text>
          </Group>
          <Text className={styles.subtitle}>
            {hasVehicle 
                ?  'Actualiza la información de tu vehículo'
              : 'Ingresa los datos de tu vehículo'
            }
          </Text>
        </Box>

        <form onSubmit={handleSubmit} className={styles.form}>
         <div className={styles.formGroup}>
                <label className={styles.label}>
                 <Camera size={16} className={styles.labelIcon} />
                 Foto del vehículo
              </label>
            <div className={styles.photoSection}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              id="vehicle-photo"
              className={styles.hiddenInput}
              disabled={viewMode}
            />
            <label 
              htmlFor="vehicle-photo" 
              className={`${styles.photoUpload} ${viewMode ? styles.disabled : ''}`}
            >
              {formData.photoUrl ? (
                <div className={styles.photoPreview}>
                  <img 
                    src={formData.photoUrl} 
                    alt="Vehículo" 
                    className={styles.previewImage}
                  />
                  {!viewMode && (
                    <div className={styles.photoOverlay}>
                      <Camera size={24} />
                      <span>Cambiar foto</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Camera size={32} />
                  <span>Agregar foto del vehículo</span>
                </div>
              )}
            </label>
            {errors.photo && (
              <Text size="sm" color="red" mt="xs">
                {errors.photo}
              </Text>
            )}
           </div>
          </div>
         
           <div className={styles.formGroup}>
              <label className={styles.label}>
                 <FileText size={16} className={styles.labelIcon} />
                  Marca
                </label>
             <TextInput
              placeholder="ej. Toyota"
              value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.currentTarget.value)}
                 error={errors.brand}
                disabled={viewMode}
                 />
          </div>
              
         <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={16} className={styles.labelIcon} />
                  Modelo
                </label>
              <TextInput
                 placeholder="ej. Corolla"
                 value={formData.model}
                 onChange={(e) => handleInputChange('model', e.currentTarget.value)}
                error={errors.model}
                 disabled={viewMode}
              />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
               <Calendar size={16} className={styles.labelIcon} />
                  Año
             </label>
              <Select
              placeholder="Seleccione año"
                data={YEARS}
                value={formData.year}
                onChange={(value) => handleInputChange('year', value || '')}
              error={errors.year}
              disabled={viewMode}
            />
          </div>
          
           <div className={styles.formGroup}>
            <label className={styles.label}>
                 <Shield size={16} className={styles.labelIcon} />
                Color
             </label>
           <Select
             placeholder="Seleccione color"
             data={COLORS}
              value={formData.color}
                onChange={(value) => handleInputChange('color', value || '')}
                 error={errors.color}
                  disabled={viewMode}
               />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={16} className={styles.labelIcon} />
                Placa
              </label>
                <TextInput
                placeholder="ABC123"
                value={formData.plate}
              onChange={(e) => handleInputChange('plate', e.currentTarget.value.toUpperCase())}
                error={errors.plate}
                disabled={viewMode}
              />
           </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
                <FileText size={16} className={styles.labelIcon} />
                 Tipo de Vehículo
              </label>
             <Select
                placeholder="Seleccione tipo"
                data={BODY_TYPES}
               value={formData.body_type}
                 onChange={(value) => handleInputChange('body_type', value || '')}
                  error={errors.body_type}
                   disabled={viewMode}
                />
            </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={16} className={styles.labelIcon} />
                Número de Motor
              </label>
                 <TextInput
                   placeholder="Ingrese número de motor"
                    value={formData.engine_number}
                 onChange={(e) => handleInputChange('engine_number', e.currentTarget.value)}
                   error={errors.engine_number}
                    disabled={viewMode}
                  />
           </div>

          <div className={styles.formGroup}>
              <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                 Número de Chasis
             </label>
                <TextInput
                 placeholder="Ingrese número de chasis"
                   value={formData.chassis_number}
                   onChange={(e) => handleInputChange('chassis_number', e.currentTarget.value)}
                   error={errors.chassis_number}
                    disabled={viewMode}
                   />
          </div>

           <div className={styles.formGroup}>
             <label className={styles.label}>
                 <FileText size={16} className={styles.labelIcon} />
                 Número VIN
              </label>
                 <TextInput
                   placeholder="Ingrese número VIN"
                     value={formData.vin_number}
                   onChange={(e) => handleInputChange('vin_number', e.currentTarget.value)}
                     error={errors.vin_number}
                     disabled={viewMode}
                  />
            </div>

          {error && (
            <Text color="red" size="sm" mt="md" className={styles.errorMessage}>
              <AlertCircle size={16} style={{ marginRight: 8 }} />
              {error}
            </Text>
          )}

          <Group justify="space-between" mt="xl" className={styles.buttonGroup}>
            <Button
              variant="outline"
              onClick={handleBack}
              className={styles.secondaryButton}
            >
              Regresar
            </Button>

            {!viewMode && (
              <Button
                onClick={handleSubmit}
                loading={loading}
                className={styles.primaryButton}
              >
                {loading 
                  ? 'Guardando...' 
                  : (hasVehicle ? 'Actualizar' : 'Guardar')
                }
              </Button>
            )}
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export const Route = createFileRoute('/RegistrarVehiculo/')({
  component: VehicleRegistration,
});

export default VehicleRegistration;
import React, { useState, useEffect } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import {
    ArrowLeft,
    Camera,
    FileText,
    Calendar,
    Users,
    RotateCw,
    AlertCircle,
    CheckCircle,
    UserRound,
    Settings
} from 'lucide-react';
import { PropertyCardData, SERVICE_TYPES } from '../../types/PropertyCardTypes';
import styles from './PropertyCar.module.css';
import { LoadingOverlay, Modal, Button, Text } from '@mantine/core';

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const PropertyCard: React.FC = () => {
    const navigate = useNavigate();
      const [formData, setFormData] = useState<PropertyCardData>({
        propertyCardNumber: '',
        identificationNumber: '',
        serviceType: 'private',
        passengerCapacity: '',
        cylinderCapacity: '',
        propertyCardExpeditionDate: '',
        frontFile: undefined,
        backFile: undefined,
          frontPreview: '',
          backPreview: '',
    });
      const [initialFormData, setInitialFormData] = useState<PropertyCardData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
      const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [vehicleId, setVehicleId] = useState<number | null>(null);
        const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [hasPropertyCard, setHasPropertyCard] = useState(false);
    const [viewMode, setViewMode] = useState(true);
      const [formHasChanged, setFormHasChanged] = useState(false);
      const [propertyCardId, setPropertyCardId] = useState<number | null>(null);
      const [userId, setUserId] = useState<string | null>(null);
      const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const loadData = async () => {
            try {
                 const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                 if (!token || !userId) {
                    navigate({ to: '/Login' });
                    return;
                }
                 setLoading(true);
                setUserId(userId);
                // Fetch User Data
                const userResponse = await fetch(`${BASE_URL}/users/${userId}`, {
                  headers: {
                      'x-token': token,
                  }
                });

                 if (!userResponse.ok) {
                  throw new Error('Error al cargar los datos del usuario');
                }
                const userData = await userResponse.json();

                if (userData && userData.data) {
                  setFormData(prev => ({
                    ...prev,
                    identificationNumber: userData.data.identification_number,
                  }));
                }
                  // Fetch Vehicle Data
                const vehicleResponse = await fetch(`${BASE_URL}/vehicles`, {
                  headers: {
                      'x-token': token,
                  }
                });

                  if (!vehicleResponse.ok) {
                  throw new Error('Error al cargar los datos del vehiculo');
                }
                 const vehicleData = await vehicleResponse.json();
                const userVehicle = vehicleData.data?.find((vehicle: any) => vehicle.user_id.toString() === userId);
                 if (userVehicle) {
                     setVehicleId(userVehicle.id);
                 } else {
                     throw new Error("No se encontró un vehículo asociado al usuario");
                 }
              //fetch property card data
                 const propertyCardResponse = await fetch(`${BASE_URL}/property_cards`, {
                     headers: {
                        'x-token': token,
                     }
                });
                    if (!propertyCardResponse.ok) {
                        console.error('Error al verificar la tarjeta de propiedad', propertyCardResponse);
                    throw new Error('Error al verificar la tarjeta de propiedad');
                    }

                  const propertyCardData = await propertyCardResponse.json();
                    console.log("propertyCardData", propertyCardData);
                    const userPropertyCard = propertyCardData.data?.find((card:any) => card.user_id.toString() === userId);
                 if(userPropertyCard) {
                    setPropertyCardId(userPropertyCard.id);
                     setHasPropertyCard(true);
                      const initialData: PropertyCardData = {
                        propertyCardNumber: userPropertyCard.license_number,
                         identificationNumber: userData.data.identification_number,
                          serviceType: userPropertyCard.service_type === 'PARTICULAR' ? 'private' : 'public',
                          passengerCapacity: userPropertyCard.passager_capacity,
                         cylinderCapacity: userPropertyCard.cylinder_capacity,
                         propertyCardExpeditionDate: userPropertyCard.expedition_date?.split('T')[0],
                        frontPreview: userPropertyCard.photo_front_url || undefined,
                          backPreview: userPropertyCard.photo_back_url || undefined,
                      };
                        setInitialFormData(initialData);
                          setFormData(initialData);
                        setViewMode(true);
                  }else {
                        console.log("No se encontró tarjeta de propiedad para este usuario")
                        setViewMode(false);
                    }

            } catch (error:any) {
                 console.error('Error al cargar los datos:', error);
                setError(error.message || 'Error al cargar datos.');
                setViewMode(false);
            } finally {
               setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.propertyCardNumber) {
            newErrors.propertyCardNumber = 'El número de la tarjeta de propiedad es requerido';
        }
    
         if (!formData.identificationNumber) {
            newErrors.identificationNumber = 'El número de identificación es requerido';
        }
        if (!formData.serviceType) {
            newErrors.serviceType = 'El tipo de servicio es requerido';
        }
        if (!formData.passengerCapacity) {
            newErrors.passengerCapacity = 'La capacidad de pasajeros es requerida';
        }
           if (!/^\d+$/.test(formData.passengerCapacity)) {
             newErrors.passengerCapacity = 'Capacidad de pasajeros inválida';
       }
        if (!formData.cylinderCapacity) {
            newErrors.cylinderCapacity = 'El cilindraje es requerido';
        }
        if (!formData.propertyCardExpeditionDate) {
            newErrors.propertyCardExpeditionDate = 'La fecha de expedición de la tarjeta es requerida';
        }
         if (!formData.frontFile && !formData.frontPreview ) {
            newErrors.frontFile = 'La foto frontal es requerida';
        }
        if (!formData.backFile && !formData.backPreview) {
            newErrors.backFile = 'La foto posterior es requerida';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
         if (!viewMode) {
         const { name, value } = e.target;
        // Validar la capacidad de pasajeros, asegurando que sea un número y que no exceda 10
          if (name === "passengerCapacity") {
                const numericValue = value.replace(/[^0-9]/g, ''); // Elimina caracteres no numéricos

              if (parseInt(numericValue) > 10) {
                 setErrors(prev => ({ ...prev, [name]: "La capacidad máxima es 10 pasajeros" }));
                 return;
              }
              if (initialFormData && initialFormData[name as keyof PropertyCardData] !== value) {
                setFormHasChanged(true);
              }else if(
                initialFormData &&
                  initialFormData[name as keyof PropertyCardData] === value &&
                  formHasChanged
              ) {
                setFormHasChanged(false);
              }


              setFormData(prev => ({ ...prev, [name]: numericValue }));
              if (errors[name]) {
                if(name) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[name];
                         return newErrors;
                     });
                }
             }
            return;
        }
         if (initialFormData && initialFormData[name as keyof PropertyCardData] !== value) {
                    setFormHasChanged(true);
                }else if(
                  initialFormData &&
                 initialFormData[name as keyof PropertyCardData] === value &&
                  formHasChanged
                ){
                     setFormHasChanged(false);
                }
              setFormData(prev => ({
            ...prev,
            [name]: value
            }));
        }else{
           const { name, value } = e.target;
              setFormData(prev => ({
                ...prev,
                  [name]: value,
                }));
        }

        const fieldName = 'name'; // Renombramos la variable para evitar conflictos

        if (errors[fieldName]) {
            if (fieldName) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName]; // Usamos la variable renombrada
                    return newErrors;
                });
            }
        }
        
    };

      const handleFileUpload = (side: 'front' | 'back') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
          if (!file) return;
          const maxSize = 5 * 1024 * 1024; // 5MB
           if (file.size > maxSize) {
                setErrors(prev => ({
                  ...prev,
                    [`${side}File`]: 'La imagen no debe exceder 5MB'
                }));
                return;
            }

          const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!validTypes.includes(file.type)) {
              setErrors(prev => ({
                  ...prev,
                  [`${side}File`]: 'Formato no válido. Use JPG, PNG o WebP'
              }));
              return;
          }
       setFormData(prev => ({
          ...prev,
            [`${side}File`]: file,
           [`${side}Preview`]: URL.createObjectURL(file)
        }));

        if (errors[`${side}File`]) {
           if(side){
             setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${side}File`];
                return newErrors;
             });
           }
        }
        if(!viewMode){
             setFormHasChanged(true);
        }
  };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
          if (isSubmitting) return;
         if (!validateForm()) {
            setError("Por favor, complete todos los campos requeridos correctamente");
            return;
         }
        setIsSubmitting(true);
        setError('');
       try {
           const token = localStorage.getItem('token');
            if (!token || !userId || !vehicleId) {
               navigate({ to: '/Login' });
               return;
              }

            const formDataToSend = new FormData();
           formDataToSend.append('license_number', formData.propertyCardNumber); // Changed to license_number
            formDataToSend.append('service_type', formData.serviceType === 'private' ? 'PARTICULAR' : 'PUBLIC');
            formDataToSend.append('passager_capacity', formData.passengerCapacity); // Changed to passager_capacity
             formDataToSend.append('cylinder_capacity', formData.cylinderCapacity);
           if (formData.propertyCardExpeditionDate) {
             const date = new Date(formData.propertyCardExpeditionDate as string);
             const formattedDate = date.toISOString().slice(0, 10);
               formDataToSend.append('expedition_date', formattedDate); // Changed to expedition_date
           }
           formDataToSend.append('vehicle_id', vehicleId.toString());
           formDataToSend.append('user_id', userId);
            formDataToSend.append('identification_number', formData.identificationNumber);


            if (formData.frontFile) {
               formDataToSend.append('photo_front_url', formData.frontFile.name);
             }
             if (formData.backFile) {
                formDataToSend.append('photo_back_url', formData.backFile.name);
              }
            console.log('Enviando datos al backend...', {
            formData: Object.fromEntries(formDataToSend.entries()),
          });

          const method = hasPropertyCard ? 'PUT' : 'POST';
           const url = hasPropertyCard
            ? `${BASE_URL}/property_cards/${propertyCardId}`
            : `${BASE_URL}/property_cards`;
           
          const response = await fetch(url, {
            method,
            headers: {
              'x-token': token
            },
            body: formDataToSend
          });

          const data = await response.json();
          if (!response.ok) {
              console.error('Error de la API:', data); // Log the error response
              throw new Error(data.msg || 'Error al registrar la tarjeta de propiedad');
          }
           setFormHasChanged(false);
            setViewMode(true);
           setSuccessMessage('Tarjeta de propiedad guardada exitosamente!');
          setIsSuccessModalOpen(true);

        } catch (error: any) {
          console.error('Error al guardar la tarjeta de propiedad:', error);
             setError(error.message || 'Error al registrar la tarjeta de propiedad');
        } finally {
            setIsSubmitting(false);
        }
      };
    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
          if (hasPropertyCard) {
               navigate({ to: '/perfil' });
           } else {
                navigate({
                    to: '/perfil',
                    search: { documentType: 'property', status: 'completed' }
                });
            }
    };

     const handleBack = () => {
        if (formHasChanged) {
           setIsModalOpen(true);
        } else {
             navigate({ to: hasPropertyCard ? '/perfil' :'/RegistrarVehiculo/DocumentsRequired' });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalConfirm = () => {
        setIsModalOpen(false);
         navigate({ to: hasPropertyCard ? '/perfil' : '/RegistrarVehiculo/DocumentsRequired' });
    };
   const handleEditClick = () => {
        setViewMode(false);
        setFormHasChanged(false);
    };
    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingOverlay visible />
            </div>
        );
    }

    return (
        <div className={styles.container}>
               {/* Confirmation Modal */}
            <Modal
                opened={isSuccessModalOpen}
                onClose={handleSuccessModalClose}
                title="Éxito"
                classNames={{
                    root: styles.modalContainer,
                    title: styles.modalTitle,
                    body: styles.modalBody,
                    header: styles.modalHeader,
                    close: styles.modalCloseButton
                }}
            >
              <div className={styles.modalContent}>
                <CheckCircle size={60} color="green" className={styles.modalIcon}/>
                <Text size="xl" fw={500} mt="md" className={styles.modalParagraph}>{successMessage}</Text>
                  <Button onClick={handleSuccessModalClose} variant="filled" color="green" className={styles.buttonModalPrimary}>
                       {hasPropertyCard ? 'Volver a Perfil' : 'Volver a Documentos'}
                    </Button>
                </div>
            </Modal>

            {/* Confirmation Exit Modal */}
            <Modal
                opened={isModalOpen}
                onClose={handleModalClose}
                title="¿Salir sin guardar cambios?"
                classNames={{
                    root: styles.modalContainer,
                    title: styles.modalTitle,
                    body: styles.modalBody,
                    header: styles.modalHeader,
                    close: styles.modalCloseButton
                }}
            >
                <p className={styles.modalParagraph}>
                    ¿Estás seguro de que deseas salir sin guardar los cambios?
                </p>
                <div className={styles.modalButtons}>
                    <Button onClick={handleModalClose} variant="outline" color="gray" className={styles.buttonModalSecondary} >
                        Cancelar
                    </Button>
                    <Button onClick={handleModalConfirm} variant="filled" color="red" className={styles.buttonModalPrimary}>
                        Salir sin guardar
                    </Button>
                </div>
            </Modal>
      <div className={styles.gradientBackground} />

      <div className={styles.content}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Tarjeta de Propiedad</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información de la Tarjeta de Propiedad */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información de la Tarjeta de Propiedad</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                    Número de Tarjeta de Propiedad
                </label>
                <input
                  type="text"
                  name="propertyCardNumber"
                  value={formData.propertyCardNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número de la tarjeta de propiedad"
                    disabled={ isSubmitting}
                />
                {errors.propertyCardNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.propertyCardNumber}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} className={styles.labelIcon} />
                  Fecha de Expedición de la Tarjeta
                </label>
                <input
                  type="date"
                  name="propertyCardExpeditionDate"
                  value={formData.propertyCardExpeditionDate}
                  onChange={handleInputChange}
                  className={styles.input}
                     disabled={isSubmitting}
                />
                {errors.propertyCardExpeditionDate && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.propertyCardExpeditionDate}
                  </span>
                )}
              </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <Users size={16} className={styles.labelIcon} />
                        Tipo de Servicio
                    </label>
                  <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className={styles.select}
                     disabled={ isSubmitting}
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  {errors.serviceType && (
                      <span className={styles.errorText}>
                          <AlertCircle size={14} />
                          {errors.serviceType}
                      </span>
                  )}
                </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Users size={16} className={styles.labelIcon} />
                  Capacidad de Pasajeros
                </label>
                <input
                  type="number"
                  name="passengerCapacity"
                  value={formData.passengerCapacity}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Capacidad máxima de pasajeros"
                     disabled={ isSubmitting}
                />
                {errors.passengerCapacity && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.passengerCapacity}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Settings size={16} className={styles.labelIcon} />
                      Cilindraje del Vehículo
                  </label>
                <input
                  type="text"
                  name="cylinderCapacity"
                  value={formData.cylinderCapacity}
                  onChange={handleInputChange}
                  className={styles.input}
                    placeholder="Cilindraje del vehículo"
                     disabled={ isSubmitting}
                />
                {errors.cylinderCapacity && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.cylinderCapacity}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Información del Propietario */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <UserRound className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información del Propietario</h2>
            </div>
             <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                       <FileText size={16} className={styles.labelIcon} />
                      Número de Identificación
                    </label>
                  <input
                      type="text"
                      value={formData.identificationNumber}
                      className={styles.input}
                      disabled
                    />
                </div>
              </div>
          </div>

          {/* Fotos del Documento */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Camera className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Fotos del Documento</h2>
            </div>
            <div className={styles.photosGrid}>
              {/* Foto Frontal */}
              <div className={styles.photoUpload}>
                <div className={styles.photoPreview}>
                  {formData.frontPreview ? (
                    <img
                      src={formData.frontPreview}
                      alt="Cara frontal"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <Camera size={40} className={styles.placeholderIcon} />
                      <span className={styles.placeholderText}>
                        Cara frontal
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload('front')}
                  className={styles.photoInput}
                  id="front-photo"
                     disabled={ isSubmitting}
                />
                <label htmlFor="front-photo" className={styles.photoLabel}>
                  <Camera size={16} />
                    {formData.frontPreview ? 'Cambiar foto frontal' : 'Agregar foto frontal'}
                </label>
                {errors.frontFile && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.frontFile}
                  </span>
                )}
              </div>

              {/* Foto Posterior */}
              <div className={styles.photoUpload}>
                <div className={styles.photoPreview}>
                  {formData.backPreview ? (
                    <img
                      src={formData.backPreview}
                      alt="Cara posterior"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <RotateCw size={40} className={styles.placeholderIcon} />
                      <span className={styles.placeholderText}>
                        Cara posterior
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload('back')}
                  className={styles.photoInput}
                  id="back-photo"
                     disabled={isSubmitting}
                />
                <label htmlFor="back-photo" className={styles.photoLabel}>
                  <RotateCw size={16} />
                    {formData.backPreview ? 'Cambiar foto posterior' : 'Agregar foto posterior'}
                </label>
                {errors.backFile && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.backFile}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mensaje de Error General */}
          {error && (
              <div className={styles.errorAlert}>
                <AlertCircle size={20} />
                  <span>{error}</span>
              </div>
            )}

          {/* Botones de Acción */}
           <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={handleBack}
                            className={styles.buttonSecondary}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft size={20} style={{ marginRight: 8 }} />
                            Volver
                        </button>
                        {hasPropertyCard && viewMode ? (
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className={styles.buttonPrimary}
                                disabled={isSubmitting}
                            >
                                <CheckCircle size={20} />
                                Editar Documento
                            </button>
                        ) : !viewMode && (
                            <button
                                type="submit"
                                className={`${styles.buttonPrimary} ${isSubmitting ? styles.loading : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className={styles.loadingText}>
                                        <span className={styles.loadingSpinner} />
                                        Guardando...
                                    </span>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        {formHasChanged ? 'Guardar Edición' : 'Guardar Documento' }
                                    </>
                                )}
                            </button>
                        )}
                    </div>
        </form>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/RegistrarVehiculo/PropertyCard')({
    component: PropertyCard,
});

export default PropertyCard; 
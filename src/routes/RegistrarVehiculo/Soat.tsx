import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import {
    ArrowLeft,
    Camera,
    FileText,
    Calendar,
    Shield,
    RotateCw,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { SoatFormData, INSURANCE_COMPANIES } from '../../types/SoatTypes';
import styles from './Soat.module.css';
import { TextInput, Modal, Button, Text } from '@mantine/core';

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

const Soat: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SoatFormData>({
        expeditionDate: '',
        expiryDate: '',
        insuranceCompany: '',
        policyNumber: '',
        identificationNumber: '',
        frontPreview: undefined,
        backPreview: undefined,
    })
    const [initialFormData, setInitialFormData] = useState<SoatFormData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasSoat, setHasSoat] = useState(false);
    const [viewMode, setViewMode] = useState(true);
    const [vehicleId, setVehicleId] = useState<number | null>(null);
    const [soatId, setSoatId] = useState<number | null>(null);
    const [, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formHasChanged, setFormHasChanged] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
     const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
     const [successMessage, setSuccessMessage] = useState<string>('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Iniciando carga de datos del SOAT...');
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token || !userId) {
                    console.log('No hay sesión activa, redirigiendo...');
                    navigate({ to: '/Login' });
                    return;
                }
                console.log('Token y userId encontrados. UserId:', userId);

                // Cargar perfil de usuario
                console.log('Cargando datos del perfil...');
                const profileResponse = await fetch(`${BASE_URL}/users/${userId}`, {
                    headers: { 'x-token': token },
                });

                if (!profileResponse.ok) {
                    throw new Error('Error al cargar el perfil');
                }

                const profileData = await profileResponse.json();
                console.log('Datos del perfil recibidos:', profileData);
                if (profileData.ok && profileData.data) {
                    setFormData((prev) => ({
                        ...prev,
                        identificationNumber: profileData.data.identification_number,
                    }));
                }

                // Cargar estado del vehículo
                console.log('Verificando datos del vehículo...');
                const vehicleResponse = await fetch(`${BASE_URL}/vehicles`, {
                    headers: { 'x-token': token },
                });
                if (!vehicleResponse.ok) {
                    console.error('Error al verificar el vehículo:', vehicleResponse);
                    throw new Error('Error al verificar el vehículo');
                }

                const vehicleData = await vehicleResponse.json();
                console.log('Datos del vehiculo:', vehicleData);
                const userVehicle = vehicleData.data?.find(
                    (vehicle: any) => vehicle.user_id.toString() === userId
                );

                if (userVehicle) {
                    setVehicleId(userVehicle.id);
                    console.log('Vehicle ID encontrado:', userVehicle.id);
                } else {
                    console.log('No se encontró el Vehicle ID para este usuario');
                }

                // Cargar info de SOAT
                console.log('Verificando datos del SOAT...');
                const soatResponse = await fetch(`${BASE_URL}/soat_details`, {
                    headers: { 'x-token': token },
                });
                if (!soatResponse.ok) {
                    console.error('Error al verificar el SOAT:', soatResponse);
                    throw new Error('Error al verificar el SOAT');
                }

                const soatData = await soatResponse.json();
                console.log('Datos de SOAT recibidos:', soatData);

                const userSoat = soatData.data?.find(
                    (soat: any) => soat.user_id.toString() === userId
                );
                if (userSoat) {
                    setSoatId(userSoat.id);
                    setHasSoat(true);
                    const initialData: SoatFormData = {
                        policyNumber: userSoat.policy_number,
                        expeditionDate: userSoat.validity_from?.split('T')[0],
                        expiryDate: userSoat.validity_to?.split('T')[0],
                        insuranceCompany: userSoat.insurance_company,
                         identificationNumber: profileData.data.identification_number,
                        frontPreview: userSoat.photo_front_url || undefined,
                        backPreview: userSoat.photo_back_url || undefined
                    }
                      setInitialFormData(initialData);
                     setFormData(initialData);
                    setViewMode(true);
                } else {
                    console.log('No se encontró SOAT para este usuario.');
                    setViewMode(false);
                }

            } catch (error) {
                console.error('Error en la carga de datos:', error);
                setError('Error al cargar información. Por favor intente nuevamente.');
                setViewMode(false);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate, userId]);

  // Validaciones específicas para SOAT
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

  

        if (!formData.expeditionDate) {
            newErrors.expeditionDate = 'La fecha de expedición es requerida';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'La fecha de vencimiento es requerida';
        } else {
            const expiry = new Date(formData.expiryDate);
            const today = new Date();
            if (expiry <= today) {
                newErrors.expiryDate = 'El SOAT debe tener una fecha de vencimiento futura';
            }
        }
         if (!formData.insuranceCompany) {
            newErrors.insuranceCompany = 'La aseguradora es requerida';
        }
       

       if (!formData.identificationNumber) {
            newErrors.identificationNumber = 'El número de identificación es requerido';
       }
      else if (!/^\d+$/.test(formData.identificationNumber)) {
             newErrors.identificationNumber = 'Número de identificación inválido';
       }


        // Validar archivos
        if (!formData.frontPreview && !formData.frontFile ) {
            newErrors.frontFile = 'La foto frontal del SOAT es requerida';
       }
        if (!formData.backPreview && !formData.backFile) {
            newErrors.backFile = 'La foto posterior del SOAT es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
  };


    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
          if (!viewMode) {
        const { name, value } = e.currentTarget;
         if (initialFormData && initialFormData[name as keyof SoatFormData] !== value) {
          setFormHasChanged(true);
         } else if (
           initialFormData &&
             initialFormData[name as keyof SoatFormData] === value &&
             formHasChanged
          ) {
          setFormHasChanged(false);
        }
             setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        } else {
         const { name, value } = e.currentTarget;
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
       }


        // Asegúrate de que 'name' sea un string o el tipo correcto
if (typeof name === "string" && errors[name]) {
  setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof typeof errors];
      return newErrors;
  });
}

    };
    // Manejador de archivos
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
            [`${side}Preview`]: file.name
        }));

        if (errors[`${side}File`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${side}File`];
                return newErrors;
            });
        }
         if (!viewMode) {
           setFormHasChanged(true);
         }
    };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    console.log('Iniciando handleSubmit con formData:', formData); // Log antes de la validación
    if (!validateForm()) {
      console.log('Validación falló, errores:', errors);
      setSubmitMessage('Por favor, corrige los errores en el formulario.');
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage(null); // Resetear el mensaje anterior

    try {
      const token = localStorage.getItem('token');
        if (!token || !userId || !vehicleId) {
        console.error('No hay token, userId o vehicleId. Redirigiendo a /Login');
        navigate({ to: '/Login' });
        return;
      }
        const formDataToSend = new FormData();

      if (vehicleId) {
        formDataToSend.append('vehicle_id', String(vehicleId));
      } else {
        console.error('Error: No se pudo obtener el vehicleId');
        setSubmitMessage(
          'Error al obtener el ID del vehículo, por favor intente nuevamente.'
        );
        return;
      }

      formDataToSend.append('user_id', String(userId));
      formDataToSend.append('policy_number', formData.policyNumber);
      formDataToSend.append(
        'identification_number',
        formData.identificationNumber
      );
      formDataToSend.append('insurance_company', formData.insuranceCompany);
      if (formData.expeditionDate) {
        const date = new Date(formData.expeditionDate as string);
        const formattedDate = date.toISOString().slice(0, 10);
        formDataToSend.append('validity_from', formattedDate);
      }
      if (formData.expiryDate) {
        const date = new Date(formData.expiryDate as string);
        const formattedDate = date.toISOString().slice(0, 10);
        formDataToSend.append('validity_to', formattedDate);
      }

        if (formData.frontFile && formData.frontPreview === undefined) {
            formDataToSend.append('photo_front_url', formData.frontFile.name);
        } else if (formData.frontPreview) {
            formDataToSend.append('photo_front_url', formData.frontPreview);
        }

         if (formData.backFile && formData.backPreview === undefined) {
            formDataToSend.append('photo_back_url', formData.backFile.name);
        } else if (formData.backPreview) {
            formDataToSend.append('photo_back_url', formData.backPreview);
        }


      const method = hasSoat ? 'PUT' : 'POST';
      const url = hasSoat
        ? `${BASE_URL}/soat_details/${soatId}`
        : `${BASE_URL}/soat_details`;

      console.log('Enviando datos al backend...', {
        method,
        url,
        formData: Object.fromEntries(formDataToSend.entries()), // Mostrar los datos a enviar
      });

      const response = await fetch(url, {
        method,
        headers: {
          'x-token': token,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
         console.error('Error al guardar el SOAT, respuesta del servidor:', errorData);
        let errorMessage = 'Error al guardar el SOAT. Por favor intente nuevamente.';
        if (errorData && errorData.errors) {
          errorMessage = errorData.errors
            .map((error: any) => error.msg)
            .join(', ');
        }
        throw new Error(errorMessage);
      }
         console.log('SOAT guardado exitosamente');
        setFormHasChanged(false);
          setViewMode(true);
        setSuccessMessage('SOAT guardado exitosamente!');
        setIsSuccessModalOpen(true);


    } catch (error: any) {
        console.error('Error en handleSubmit:', error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error.message ||
          'Error al guardar el SOAT. Por favor intente nuevamente.',
      }));
          setSubmitMessage(
            error.message ||
                'Error al guardar el SOAT. Por favor intente nuevamente.'
          );
    } finally {
        setIsSubmitting(false);
    }
  };

    const handleBack = () => {
        if (formHasChanged) {
            setIsModalOpen(true);
        } else {
            navigate({ to: '/perfil' });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalConfirm = () => {
        setIsModalOpen(false);
        navigate({ to: '/perfil' });
    };

     const handleSuccessModalClose = () => {
         setIsSuccessModalOpen(false);
           if (hasSoat) {
                navigate({ to: '/perfil' });
            } else {
               navigate({
                to: '/perfil',
                search: { documentType: 'soat', status: 'completed' },
                });
            }

    };


    const handleEditClick = () => {
        setViewMode(false);
        setFormHasChanged(false);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.gradientBackground} />
                <div className={styles.loadingContainer}>
                    <span className={styles.loadingSpinner} />
                </div>
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
                         {hasSoat ? 'Volver a Perfil' : 'Volver a Documentos'}
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
                    <div className={styles.navigationHeader}>
                        <button onClick={handleBack} className={styles.backButton}>
                            <ArrowLeft size={20} />
                            <span>Volver</span>
                        </button>
                    </div>
                    <h1 className={styles.title}>SOAT</h1>
                    <p className={styles.subtitle}>
                        Registro del Seguro Obligatorio de Accidentes de Tránsito
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Información del Documento */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FileText className={styles.sectionIcon} size={24} />
                            <h2 className={styles.sectionTitle}>Información del SOAT</h2>
                        </div>
                        <div className={styles.formGrid}>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FileText size={16} className={styles.labelIcon} />
                                    Número de Identificación
                                </label>
                                <TextInput
                                    type="text"
                                    name="identificationNumber"
                                    value={formData.identificationNumber}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Número de identificación del usuario"
                                    disabled={true}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Shield size={16} className={styles.labelIcon} />
                                    Aseguradora
                                </label>
                                <select
                                    name="insuranceCompany"
                                    value={formData.insuranceCompany}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                     disabled={isSubmitting}
                                >
                                    <option value="">Seleccione aseguradora</option>
                                    {INSURANCE_COMPANIES.map(company => (
                                        <option key={company.value} value={company.value}>
                                            {company.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.insuranceCompany && (
                                    <span className={styles.errorText}>
                                        <AlertCircle size={14} />
                                        {errors.insuranceCompany}
                                    </span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FileText size={16} className={styles.labelIcon} />
                                    Número de Póliza
                                </label>
                                <TextInput
                                    type="text"
                                    name="policyNumber"
                                    value={formData.policyNumber}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Número de póliza SOAT"
                                    disabled={isSubmitting}
                                    error={errors.policyNumber}
                                />
                            </div>


                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Calendar size={16} className={styles.labelIcon} />
                                    Fecha de Expedición
                                </label>
                                <TextInput
                                    type="date"
                                    name="expeditionDate"
                                    value={formData.expeditionDate}
                                     onChange={handleInputChange}
                                    className={styles.input}
                                    max={new Date().toISOString().split('T')[0]}
                                     disabled={isSubmitting}
                                    error={errors.expeditionDate}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Calendar size={16} className={styles.labelIcon} />
                                    Fecha de Vencimiento
                                </label>
                                <TextInput
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    min={new Date().toISOString().split('T')[0]}
                                    disabled={isSubmitting}
                                    error={errors.expiryDate}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fotos del Documento */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Camera className={styles.sectionIcon} size={24} />
                            <h2 className={styles.sectionTitle}>Fotos del SOAT</h2>
                        </div>
                        <div className={styles.photosGrid}>
                            {/* Foto Frontal */}
                            <div className={styles.photoUpload}>
                                <div className={styles.photoPreview}>
                                    {formData.frontPreview || formData.frontPreview ? (
                                        <img
                                            src={formData.frontPreview || formData.frontPreview || ""}
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
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="front-photo" className={styles.photoLabel}>
                                    <Camera size={16} />
                                    {formData.frontPreview || formData.frontPreview ? 'Cambiar foto frontal' : 'Agregar foto frontal'}
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
                                    {formData.backPreview || formData.backPreview ? (
                                        <img
                                            src={formData.backPreview || formData.backPreview || ""}
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
                                    {formData.backPreview || formData.backPreview ? 'Cambiar foto posterior' : 'Agregar foto posterior'}
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
                    {submitMessage && (
                        <div
                            className={`${styles.submitMessage} ${
                                submitMessage.includes('exitosamente')
                                    ? styles.successMessage
                                    : styles.errorMessage
                            }`}
                        >
                            <span>{submitMessage}</span>
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
                        {hasSoat && viewMode ? (
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className={styles.buttonPrimary}
                                disabled={isSubmitting}
                            >
                                <CheckCircle size={20} />
                                Editar SOAT
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
                                        Guardar SOAT
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

export const Route = createFileRoute('/RegistrarVehiculo/Soat')({
    component: Soat,
});

export default Soat;
import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    ArrowLeft,
    Camera,
    Calendar,
    Heart,
    FileText,
    Shield,
    AlertCircle,
    CheckCircle,
    User,
} from 'lucide-react';
import {
    type DocumentFormData,
    LICENSE_CATEGORIES,
    BLOOD_TYPES,
} from '../../types/DocumentTypes';
import styles from './License.module.css';
import { createFileRoute } from '@tanstack/react-router';
import {
    TextInput,
    Select,
    Modal,
    Button,
} from '@mantine/core';

const BASE_URL = 'https://rest-sorella-production.up.railway.app/api';

interface ValidationErrors {
    [key: string]: string;
}

interface DriverLicenseData
    extends Omit<DocumentFormData, 'vehicle_id' | 'documentType'> {
    id?: number;
    photo_front_url?: string;
    photo_back_url?: string;
    expedition_date?: string;
    expiry_date?: string;
    user_id?: string;
    frontFile?: File;
    backFile?: File;
    licenseNumber?: string;
    identificationNumber?: string;
}

const License: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<DriverLicenseData>({
        licenseNumber: '',
        expeditionDate: '',
        expiryDate: '',
        licenseCategory: 'B1',
        bloodType: 'O+',
        frontPreview: undefined,
        backPreview: undefined,
        identificationNumber: '',
        photo_front_url: undefined,
        photo_back_url: undefined,
        frontFile: undefined,
        backFile: undefined,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasLicense, setHasLicense] = useState(false);
    const [viewMode, setViewMode] = useState(true);
    const [vehicleId, setVehicleId] = useState<number | null>(null);
    const [licenseId, setLicenseId] = useState<number | null>(null);
    const [, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formHasChanged, setFormHasChanged] = useState(false);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Iniciando carga de datos de la licencia...');
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

                // Cargar info de licencias
                console.log('Verificando datos de la licencia...');
                const licenseResponse = await fetch(`${BASE_URL}/driver_licenses`, {
                    headers: { 'x-token': token },
                });

                if (!licenseResponse.ok) {
                    console.error('Error al verificar la licencia:', licenseResponse);
                    throw new Error('Error al verificar la licencia');
                }

                const licenseData = await licenseResponse.json();
                console.log('Datos de la licencia recibidos:', licenseData);

                const userLicense = licenseData.data?.find(
                    (license: any) => license.user_id.toString() === userId
                );

                if (userLicense) {
                    setLicenseId(userLicense.id);
                    setHasLicense(true);
                    setFormData((prev) => ({
                        ...prev,
                        licenseNumber: userLicense.license_number,
                        expeditionDate: userLicense.expedition_date?.split('T')[0],
                        expiryDate: userLicense.expiration_date?.split('T')[0],
                        photo_front_url: userLicense.photo_front_url || undefined,
                        photo_back_url: userLicense.photo_back_url || undefined,
                    }));
                    setViewMode(false);
                } else {
                    console.log('No se encontró licencia para este usuario.');
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

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.licenseNumber?.trim() || formData.licenseNumber === '')
            newErrors.licenseNumber = 'El número de licencia es requerido';
        if (formData.licenseNumber && formData.licenseNumber.trim().length > 20)
            newErrors.licenseNumber = 'El número de licencia no debe superar los 20 caracteres';

        if (!formData.identificationNumber?.trim() || formData.identificationNumber === '')
            newErrors.identificationNumber =
                'El número de identificación es requerido';
        if (formData.identificationNumber && formData.identificationNumber.trim().length > 20)
            newErrors.identificationNumber =
            'El número de identificación no debe superar los 20 caracteres';

        if (!formData.expeditionDate)
            newErrors.expeditionDate = 'La fecha de expedición es requerida';
        if (!formData.expiryDate)
            newErrors.expiryDate = 'La fecha de vencimiento es requerida';

        if (!formData.bloodType?.trim() || formData.bloodType === '')
            newErrors.bloodType = 'El tipo de sangre es requerido';
        if (formData.bloodType && formData.bloodType.trim().length > 5)
            newErrors.bloodType = 'El tipo de sangre no debe superar los 5 caracteres';

        if (!formData.licenseCategory?.trim() || formData.licenseCategory === '')
            newErrors.licenseCategory = 'La categoría es requerida';

        if (formData.licenseCategory && formData.licenseCategory.trim().length > 10)
            newErrors.licenseCategory = 'La categoría no debe superar los 10 caracteres';
        if (!formData.photo_front_url && !formData.frontFile)
            newErrors.frontFile = 'La foto frontal es requerida';
        if (!formData.photo_back_url && !formData.backFile)
            newErrors.backFile = 'La foto posterior es requerida';


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (name: string, value: string) => {
       if (!viewMode) {
        setFormHasChanged(true);
      }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

   const handleFileUpload =
        (side: 'front' | 'back') => async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
              if (!file) return;
              const maxSize = 5 * 1024 * 1024; // 5MB
              if (file.size > maxSize) {
                  setErrors((prev) => ({
                      ...prev,
                      [`${side}File`]: 'La imagen no debe exceder 5MB',
                  }));
                  return;
              }

              const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
              if (!validTypes.includes(file.type)) {
                  setErrors((prev) => ({
                      ...prev,
                      [`${side}File`]: 'Formato no válido. Use JPG, PNG o HEIC',
                  }));
                  return;
              }
              setFormData((prev) => ({
              ...prev,
              [`${side}File`]: file,
             [`${side}Preview`]: file.name
              }));
                if (errors[`${side}File`]) {
                      setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors[`${side}File`];
                          return newErrors;
                      });
                  }
        };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token || !userId || !vehicleId) {
                navigate({ to: '/Login' });
                return;
            }
            console.log('Construyendo FormData...');
            const formDataToSend = new FormData();

            if (vehicleId) {
                formDataToSend.append('vehicle_id', vehicleId.toString());
                 console.log('Vehicle ID agregado a FormData:', vehicleId);
            } else {
                console.error("Error: No se pudo obtener el vehicleId");
                setError('Error al obtener el ID del vehículo, por favor intente nuevamente.');
                return;
            }
              formDataToSend.append('user_id', userId);
            console.log('Agregando campos del formulario...');

             formDataToSend.append('license_number', String(formData.licenseNumber).trim());
             formDataToSend.append('identification_number', String(formData.identificationNumber).trim());

           if(formData.expeditionDate) {
               const date = new Date(formData.expeditionDate as string);
               const formattedDate = date.toISOString().slice(0, 10);
                formDataToSend.append('expedition_date', formattedDate);
           }

            if(formData.expiryDate) {
               const date = new Date(formData.expiryDate as string);
               const formattedDate = date.toISOString().slice(0, 10);
                formDataToSend.append('expiration_date', formattedDate);
           }
            formDataToSend.append('license_category', String(formData.licenseCategory).trim());
             formDataToSend.append('blood_type', String(formData.bloodType).trim());

            if (formData.frontFile && formData.photo_front_url === undefined ) {
              formDataToSend.append('photo_front_url', formData.frontFile.name);
                 console.log("se agrego la foto frontal como url usando el nombre del file")
           } else if (formData.photo_front_url) {
               formDataToSend.append('photo_front_url', formData.photo_front_url);
                  console.log("se agrego la foto frontal como url")
             }

            if (formData.backFile && formData.photo_back_url === undefined) {
                formDataToSend.append('photo_back_url', formData.backFile.name);
                 console.log("se agrego la foto trasera como url usando el nombre del file")
             }
            else if (formData.photo_back_url) {
                 formDataToSend.append('photo_back_url', formData.photo_back_url);
                  console.log("se agrego la foto trasera como url")
              }


             console.log('Data a enviar:', Object.fromEntries(formDataToSend));
            for (const pair of formDataToSend.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }

            const method = hasLicense ? 'PUT' : 'POST';
            const url = hasLicense
                ? `${BASE_URL}/driver_licenses/${licenseId}`
                : `${BASE_URL}/driver_licenses`;

            console.log('Método HTTP:', method);
            console.log('URL de la petición:', url);
            const response = await fetch(url, {
                method,
                headers: {
                    'x-token': token,
                },
                body: formDataToSend,
            });
              console.log('Respuesta del servidor:', response);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al guardar la licencia, response:', errorData);
                 console.log('response:', response);

                let errorMessage = 'Error al guardar la licencia. Por favor intente nuevamente.';
                    if (errorData && errorData.errors) {
                        errorMessage = errorData.errors.map((error: any) => error.msg).join(', ');
                    }
                    throw new Error(errorMessage);
            }
            // Si la respuesta es ok, entonces la licencia se guardó
            console.log('Licencia guardada correctamente');
            setFormHasChanged(false);
            setViewMode(true);
            navigate({ to: '/Perfil' });
        } catch (error: any) {
            console.error('Error al guardar la licencia catch:', error);
            setErrors((prev) => ({
                ...prev,
                submit: error.message || 'Error al guardar la licencia. Por favor intente nuevamente.',
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleEditClick = () => {
      setViewMode(false);
      setFormHasChanged(false);
  };


    const handleBack = () => {
        if (formHasChanged) {
            setIsModalOpen(true);
        } else {
            navigate({ to: '/Perfil' });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalConfirm = () => {
        setIsModalOpen(false);
        navigate({ to: '/Perfil' });
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
                     <Button onClick={handleModalClose}  variant="outline" color="gray"  className={styles.buttonModalSecondary} >
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
                    <button
                        onClick={handleBack}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </button>
                    <h1 className={styles.title}>Licencia de Conducción</h1>
                </div>
                <form onSubmit={handleSubmit} className={styles.form} >
                    {/* Información de la Licencia */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FileText className={styles.sectionIcon} size={24} />
                            <h2 className={styles.sectionTitle}>Información de la Licencia</h2>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Shield size={16} className={styles.labelIcon} />
                                    Número de Licencia
                                </label>
                                <TextInput
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={(e) => handleInputChange('licenseNumber', e.currentTarget.value)}
                                    className={styles.input}
                                    disabled={viewMode || isSubmitting}
                                    error={errors.licenseNumber}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <User size={16} className={styles.labelIcon} />
                                    Número de Identificación
                                </label>
                                <TextInput
                                    type="text"
                                    name="identificationNumber"
                                    value={formData.identificationNumber}
                                    onChange={(e) => handleInputChange('identificationNumber', e.currentTarget.value)}
                                    className={styles.input}
                                    disabled={true}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Shield size={16} className={styles.labelIcon} />
                                    Categoría
                                </label>
                                <Select
                                    name="licenseCategory"
                                    value={formData.licenseCategory}
                                    onChange={(value) => handleInputChange('licenseCategory', value || '')}
                                    className={styles.select}
                                    disabled={viewMode || isSubmitting}
                                    data={LICENSE_CATEGORIES.map(category => ({ value: category.value, label: category.label }))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <Heart size={16} className={styles.labelIcon} />
                                    Tipo de Sangre
                                </label>
                                <Select
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={(value) => handleInputChange('bloodType', value || '')}
                                    className={styles.select}
                                    disabled={viewMode || isSubmitting}
                                    data={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
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
                                    onChange={(e) => handleInputChange('expeditionDate', e.currentTarget.value)}
                                    className={styles.input}
                                    max={new Date().toISOString().split('T')[0]}
                                    disabled={viewMode || isSubmitting}
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
                                    onChange={(e) => handleInputChange('expiryDate', e.currentTarget.value)}
                                    className={styles.input}
                                    min={new Date().toISOString().split('T')[0]}
                                    disabled={viewMode || isSubmitting}
                                    error={errors.expiryDate}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Fotos del Documento */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Camera className={styles.sectionIcon} size={24} />
                            <h2 className={styles.sectionTitle}>Fotos de la Licencia</h2>
                        </div>
                        <div className={styles.photosGrid}>
                            {/* Foto Frontal */}
                            <div className={styles.photoUpload}>
                                <div className={styles.photoPreview}>
                                    {formData.frontPreview || formData.photo_front_url ? (
                                        <img
                                            src={formData.frontPreview || formData.photo_front_url || ""}
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
                                    accept="image/jpeg,image/png,image/heic"
                                    onChange={handleFileUpload('front')}
                                    className={styles.photoInput}
                                    id="front-photo"
                                    disabled={viewMode || isSubmitting}
                                />
                                <label htmlFor="front-photo" className={styles.photoLabel}>
                                    <Camera size={16} />
                                    {formData.frontPreview || formData.photo_front_url ? 'Cambiar foto frontal' : 'Agregar foto frontal'}
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
                                    {formData.backPreview || formData.photo_back_url ? (
                                        <img
                                            src={formData.backPreview || formData.photo_back_url || ""}
                                            alt="Cara posterior"
                                            className={styles.previewImage}
                                        />
                                    ) : (
                                        <div className={styles.photoPlaceholder}>
                                            <Camera size={40} className={styles.placeholderIcon} />
                                            <span className={styles.placeholderText}>
                                                Cara posterior
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/heic"
                                    onChange={handleFileUpload('back')}
                                    className={styles.photoInput}
                                    id="back-photo"
                                    disabled={viewMode || isSubmitting}
                                />
                                <label htmlFor="back-photo" className={styles.photoLabel}>
                                    <Camera size={16} />
                                    {formData.backPreview || formData.photo_back_url ? 'Cambiar foto posterior' : 'Agregar foto posterior'}
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
                    {errors.submit && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={20} />
                            <span>{errors.submit}</span>
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
                        {hasLicense && viewMode ? (
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className={styles.buttonPrimary}
                                disabled={isSubmitting}
                            >
                                <CheckCircle size={20} />
                                Editar Licencia
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
                                        Guardar Licencia
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

export const Route = createFileRoute('/RegistrarVehiculo/License')({
    component: License,
});

export default License;
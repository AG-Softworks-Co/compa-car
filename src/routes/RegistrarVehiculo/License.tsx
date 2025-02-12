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
    Text,
} from '@mantine/core';
import { supabase } from '@/lib/supabaseClient';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';



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
    const [] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formHasChanged, setFormHasChanged] = useState(false);



    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Iniciando carga de datos de la licencia...');
                setLoading(true);
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    console.log('No hay sesión activa, redirigiendo...');
                    navigate({ to: '/Login' });
                    return;
                }

                // Cargar datos del vehículo
                const { data: vehicleData, error: vehicleError } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (vehicleError) throw vehicleError;
                if (vehicleData) {
                    setVehicleId(vehicleData.id);
                }

                // Cargar datos de la licencia
                const { data: licenseData, error: licenseError } = await supabase
                    .from('driver_licenses')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (licenseError && licenseError.code !== 'PGRST116') {
                    throw licenseError;
                }

                if (licenseData) {
                                    setLicenseId(licenseData.id);
                                    setHasLicense(true);
                                    setFormData(prev => ({
                                        ...prev,
                                        licenseNumber: licenseData.license_number || '',
                                        expeditionDate: licenseData.expedition_date?.split('T')[0] || '',
                                        expiryDate: licenseData.expiration_date?.split('T')[0] || '',
                                        photo_front_url: licenseData.photo_front_url || undefined,
                                        photo_back_url: licenseData.photo_back_url || undefined,
                                        bloodType: licenseData.blood_type || 'O+',
                                        licenseCategory: licenseData.license_category || 'B1',
                                        identificationNumber: licenseData.identification_number || '',
                                    }));
                                }
                setViewMode(!hasLicense);
            } catch (error) {
                console.error('Error en la carga de datos:', error);
                showErrorNotification('Error al cargar información. Por favor intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.licenseNumber?.trim())
            newErrors.licenseNumber = 'El número de licencia es requerido';

        if (!formData.identificationNumber?.trim())
            newErrors.identificationNumber = 'El número de identificación es requerido';

        if (!formData.expeditionDate)
            newErrors.expeditionDate = 'La fecha de expedición es requerida';

        if (!formData.expiryDate)
            newErrors.expiryDate = 'La fecha de vencimiento es requerida';

        // Removed photo validation - now optional

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

    const uploadPhoto = async (file: File, path: string): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('licenses')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('licenses')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading photo:', error);
            return null;
        }
    };

    const showSuccessModal = () => {
        modals.open({
            title: 'Operación Exitosa',
            children: (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CheckCircle size={50} color="green" style={{ marginBottom: '15px' }} />
                    <Text size="lg">
                        {hasLicense ? 'Licencia actualizada correctamente' : 'Licencia registrada correctamente'}
                    </Text>
                    <Button
                        onClick={() => {
                            modals.closeAll();
                            navigate({ to: '/Perfil' });
                        }}
                        style={{ marginTop: '20px' }}
                    >
                        Aceptar
                    </Button>
                </div>
            ),
            closeOnClickOutside: false,
            closeOnEscape: false,
        });
    };

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: 'Error',
            message,
            color: 'red',
            icon: <AlertCircle />,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const userId = localStorage.getItem('userId');
            if (!userId || !vehicleId) {
                throw new Error('Información de usuario o vehículo no disponible');
            }

            let frontPhotoUrl = formData.photo_front_url;
            let backPhotoUrl = formData.photo_back_url;

            // Upload new photos if provided
            if (formData.frontFile) {
                const uploadedFrontUrl = await uploadPhoto(formData.frontFile, 'front');
                if (uploadedFrontUrl) frontPhotoUrl = uploadedFrontUrl;
            }

            if (formData.backFile) {
                const uploadedBackUrl = await uploadPhoto(formData.backFile, 'back');
                if (uploadedBackUrl) backPhotoUrl = uploadedBackUrl;
            }

            const licenseData = {
                user_id: userId,
                vehicle_id: vehicleId,
                license_number: formData.licenseNumber?.trim() ?? '',
                identification_number: formData.identificationNumber?.trim() ?? '',
                expedition_date: formData.expeditionDate,
                expiration_date: formData.expiryDate,
                license_category: formData.licenseCategory,
                blood_type: formData.bloodType,
                photo_front_url: frontPhotoUrl,
                photo_back_url: backPhotoUrl,
            };

            if (hasLicense && licenseId) {
                const { error } = await supabase
                    .from('driver_licenses')
                    .update(licenseData)
                    .eq('id', licenseId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('driver_licenses')
                    .insert([licenseData]);

                if (error) throw error;
            }

            showSuccessModal();
        } catch (error: any) {
            console.error('Error al guardar la licencia:', error);
            showErrorNotification(error.message || 'Error al guardar la licencia');
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
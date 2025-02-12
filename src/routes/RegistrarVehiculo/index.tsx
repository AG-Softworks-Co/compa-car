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
import { supabase } from '@/lib/supabaseClient';
import styles from './index.module.css';

interface VehicleFormData {
    id?: number;
    user_id: string;
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

interface UserProfile {
    id: number;
    user_id: string;
    first_name?: string;  // Adjust based on your user_profiles table
    last_name?: string;
    // ... other profile fields
}

interface ValidationErrors {
    [key: string]: string;
}

interface VehicleData {
    id: number;
    user_id: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    plate: string | null;
    color: string | null;
    body_type: string | null;
    engine_number: string | null;
    chassis_number: string | null;
    vin_number: string | null;
    photo_url?: string | null;
    // ... other vehicle fields
}

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
    const [viewMode, setViewMode] = useState(true); // Default to view mode
    const [hasVehicle, setHasVehicle] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [formData, setFormData] = useState<VehicleFormData>({
        user_id: '',
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

    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.warn("Error fetching user profile:", error);
                return null; // Return null in case of error
            }

            return data || null; // Return the profile data or null if not found
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null; // Handle unexpected errors
        }
    };

    const fetchVehicleData = async (userId: string): Promise<VehicleData | null> => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('No vehicle found for user');
                    return null;
                }
                console.error("Error fetching vehicle data:", error);
                throw error;
            }

            return data || null; // Return the vehicle data or null if not found
        } catch (error) {
            console.error('Error fetching vehicle data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(`Error loading vehicle information: ${errorMessage}`);
            return null;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setInitialLoading(true);
            setError("");

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id) {
                    navigate({ to: '/Login' });
                    return;
                }

                const userId = session.user.id;

                // Fetch both user profile and vehicle data in parallel
                const [profile, vehicle] = await Promise.all([
                    fetchUserProfile(userId),
                    fetchVehicleData(userId)
                ]);

                setUserProfile(profile); // Set user profile data
                if (vehicle) {
                    // Vehicle data found, populate the form
                    setHasVehicle(true);
                    setFormData({
                        user_id: userId,
                        id: vehicle.id,
                        brand: vehicle.brand || '',
                        model: vehicle.model || '',
                        year: vehicle.year?.toString() || '',
                        plate: vehicle.plate || '',
                        color: vehicle.color || '',
                        body_type: vehicle.body_type || '',
                        engine_number: vehicle.engine_number || '',
                        chassis_number: vehicle.chassis_number || '',
                        vin_number: vehicle.vin_number || '',
                        photoUrl: vehicle.photo_url,
                        photo: null // Reset the photo file
                    });
                    setViewMode(true);

                } else {
                    // No vehicle data found
                    setHasVehicle(false);
                }

            } catch (err: any) {
                console.error('Error during data load:', err);
                setError(`Error loading data: ${err.message}`);
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
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

        const plateRegex = /^[A-Z]{3}\d{3}$/;
        if (!plateRegex.test(formData.plate.toUpperCase())) {
            newErrors.plate = 'Formato de placa inválido (ejemplo: ABC123)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (name: string, value: string) => {
        if (viewMode) return; // Disable changes in view mode

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
        if (viewMode) return; // Disable changes in view mode

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

    const uploadVehiclePhoto = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `vehicle-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('vehicles')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading photo:', error);
            setError(`Error uploading photo: ${error}`);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setError("Por favor, complete todos los campos requeridos correctamente");
            return;
        }

        try {
            setLoading(true);
            setError("");

            let photoUrl = formData.photoUrl;

            if (formData.photo) {
                const uploadedUrl = await uploadVehiclePhoto(formData.photo);
                if (uploadedUrl) {
                    photoUrl = uploadedUrl;
                }
            }

            const vehicleData = {
                user_id: formData.user_id,
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year),
                plate: formData.plate.trim().toUpperCase(),
                color: formData.color,
                body_type: formData.body_type,
                engine_number: formData.engine_number.trim(),
                chassis_number: formData.chassis_number.trim(),
                vin_number: formData.vin_number.trim(),
                photo_url: photoUrl,
            };

            if (hasVehicle && formData.id) {  // Use ID when updating
                const { error: updateError } = await supabase
                    .from('vehicles')
                    .update(vehicleData)
                    .eq('id', formData.id);

                if (updateError) {
                    console.error("Update error:", updateError);
                    setError(`Error updating vehicle: ${updateError.message}`);
                    throw updateError;
                }
            } else {
                const { error: insertError } = await supabase
                    .from('vehicles')
                    .insert([vehicleData]);

                if (insertError) {
                    console.error("Insert error:", insertError);
                    setError(`Error inserting vehicle: ${insertError.message}`);
                    throw insertError;
                }
            }

            navigate({ to: '/Perfil' });

        } catch (err: any) {
            console.error('Error processing vehicle:', err);
            setError(`Error saving vehicle data: ${err.message || "An error occurred"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate({ to: '/Perfil' });
    };

    const toggleViewMode = () => {
        setViewMode(!viewMode);
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
                            ? 'Esta es la información registrada de tu vehículo'
                            : 'Ingresa los datos de tu vehículo'
                        }
                    </Text>
                </Box>
                {userProfile && (
                    <Box>
                        <Text>Bienvenido, {userProfile.first_name || 'Usuario'}</Text>
                        {/* Display other user profile information here */}
                    </Box>
                )}

                <form className={styles.form}>
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
                        {hasVehicle && (
                            <Button onClick={toggleViewMode} className={styles.secondaryButton}>
                                {viewMode ? 'Editar' : 'Ver'}
                            </Button>
                        )}

                        <Button
                            onClick={handleSubmit}
                            loading={loading}
                            className={styles.primaryButton}
                            disabled={viewMode}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
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
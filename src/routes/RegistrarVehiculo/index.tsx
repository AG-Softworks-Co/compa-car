// src/routes/RegistrarVehiculo/index.tsx

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Camera, 
  Car, 
  Info,
  FileText,
  Shield,
  Edit2,
  Calendar,
  Key
} from 'lucide-react';
import type { VehicleFormData, ValidationErrors } from '../../types/FormsVehicle';
import { VEHICLE_COLORS, AVAILABLE_YEARS } from '../../types/FormsVehicle';
import styles from './index.module.css';

const validateLicensePlate = (plate: string): boolean => {
  const regex = /^[A-Z]{3}\d{3}$/;
  return regex.test(plate.replace(/-/g, '').toUpperCase());
};

const validateVIN = (vin: string): boolean => {
  const regex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return regex.test(vin.toUpperCase());
};

const VehicleRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    lastMaintenanceDate: '',
    photo: null,
    photoPreview: null,
    documents: {}
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'brand':
        return value.trim() ? '' : 'La marca es requerida';
      case 'model':
        return value.trim() ? '' : 'El modelo es requerido';
      case 'licensePlate':
        return validateLicensePlate(value) ? '' : 'Formato inválido. Ejemplo: ABC123';
      case 'vin':
        return validateVIN(value) ? '' : 'VIN inválido (17 caracteres alfanuméricos)';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // Si estamos en el resumen, volvemos al formulario de información del vehículo
      setCurrentStep(1);
    } else {
      // Si estamos en el formulario de información del vehículo, volvemos al perfil
      navigate({ to: '/perfil' });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (currentStep === 1) {
      if (!formData.brand) newErrors.brand = 'La marca es requerida';
      if (!formData.model) newErrors.model = 'El modelo es requerido';
      if (!formData.year) newErrors.year = 'El año es requerido';
      if (!formData.color) newErrors.color = 'El color es requerido';
      if (!validateLicensePlate(formData.licensePlate)) {
        newErrors.licensePlate = 'Formato de placa inválido';
      }
      if (!validateVIN(formData.vin)) {
        newErrors.vin = 'VIN inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep()) {
      setCurrentStep(3); // Pasar al resumen
    } else if (currentStep === 3) {
      // Enviar o procesar la información final
      navigate({ to: '/RegistrarVehiculo/DocumentsRequired' });
    }
  };

  const renderVehicleForm = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Car className={styles.sectionIcon} />
        <h2>Información del Vehículo</h2>
      </div>

      <div className={styles.photoUpload}>
        <div className={styles.photoPreview}>
          {formData.photoPreview ? (
            <img 
              src={formData.photoPreview} 
              alt="Vista previa del vehículo" 
              className={styles.previewImage}
            />
          ) : (
            <Camera size={40} className={styles.cameraIcon} />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className={styles.photoInput}
          id="vehicle-photo"
        />
        <label htmlFor="vehicle-photo" className={styles.photoLabel}>
          {formData.photoPreview ? 'Cambiar foto' : 'Agregar foto del vehículo'}
        </label>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Marca</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.brand ? styles.inputError : ''}`}
            placeholder="ej. Toyota"
          />
          {errors.brand && <span className={styles.errorText}>{errors.brand}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Modelo</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.model ? styles.inputError : ''}`}
            placeholder="ej. Corolla"
          />
          {errors.model && <span className={styles.errorText}>{errors.model}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Año</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className={`${styles.select} ${errors.year ? styles.inputError : ''}`}
          >
            <option value="">Seleccione año</option>
            {AVAILABLE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && <span className={styles.errorText}>{errors.year}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Color</label>
          <select
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className={`${styles.select} ${errors.color ? styles.inputError : ''}`}
          >
            <option value="">Seleccione color</option>
            {VEHICLE_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          {errors.color && <span className={styles.errorText}>{errors.color}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Placa</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.licensePlate ? styles.inputError : ''}`}
            placeholder="ej. ABC123"
          />
          {errors.licensePlate && <span className={styles.errorText}>{errors.licensePlate}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>VIN</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.vin ? styles.inputError : ''}`}
            placeholder="17 caracteres alfanuméricos"
          />
          {errors.vin && <span className={styles.errorText}>{errors.vin}</span>}
        </div>
      </div>
    </div>
  );
  const renderSummary = () => (
    <div className={styles.section}>
        <div className={styles.sectionHeader}>
            <Info className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Resumen y Confirmación</h2>
        </div>
        <p className={styles.subtitle}>
            Verifique que la información sea correcta antes de continuar
        </p>

        <div className={styles.summaryContainer}>
            {/* Vista previa del vehículo */}
            {formData.photoPreview && (
                <div className={styles.summaryPhotoContainer}>
                    <img 
                        src={formData.photoPreview} 
                        alt="Vista previa del vehículo" 
                        className={styles.summaryPhoto}
                    />
                    <div className={styles.photoOverlay}>
                        <button 
                            onClick={() => document.getElementById('vehicle-photo')?.click()}
                            className={styles.editPhotoButton}
                        >
                            <Camera size={18} />
                            Cambiar foto
                        </button>
                    </div>
                </div>
            )}

            {/* Detalles del Vehículo */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryCardHeader}>
                    <Car className={styles.summaryCardIcon} />
                    <h3 className={styles.summaryCardTitle}>Detalles del Vehículo</h3>
                </div>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <Car size={16} />
                            Marca
                        </span>
                        <span className={styles.fieldValue}>{formData.brand}</span>
                    </div>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <Info size={16} />
                            Modelo
                        </span>
                        <span className={styles.fieldValue}>{formData.model}</span>
                    </div>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <Calendar size={16} />
                            Año
                        </span>
                        <span className={styles.fieldValue}>{formData.year}</span>
                    </div>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <Info size={16} />
                            Color
                        </span>
                        <div className={styles.colorValue}>
                            <span 
                                className={styles.colorSwatch}
                                style={{ backgroundColor: formData.color.toLowerCase() }}
                            />
                            <span>{formData.color}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de Identificación */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryCardHeader}>
                    <Key className={styles.summaryCardIcon} />
                    <h3 className={styles.summaryCardTitle}>Identificación</h3>
                </div>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <Key size={16} />
                            Placa
                        </span>
                        <span className={styles.highlightValue}>
                            {formData.licensePlate}
                        </span>
                    </div>
                    <div className={styles.summaryField}>
                        <span className={styles.fieldLabel}>
                            <FileText size={16} />
                            VIN
                        </span>
                        <span className={styles.fieldValue}>{formData.vin}</span>
                    </div>
                    {formData.lastMaintenanceDate && (
                        <div className={styles.summaryField}>
                            <span className={styles.fieldLabel}>
                                <Calendar size={16} />
                                Último Mantenimiento
                            </span>
                            <span className={styles.dateValue}>
                                {new Date(formData.lastMaintenanceDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Próximos Pasos */}
            <div className={styles.summaryCard}>
                <div className={styles.summaryCardHeader}>
                    <FileText className={styles.summaryCardIcon} />
                    <h3 className={styles.summaryCardTitle}>Documentación Requerida</h3>
                </div>
                <div className={styles.documentList}>
                    <div className={styles.documentItem}>
                        <FileText size={20} />
                        <span>Tarjeta de Propiedad</span>
                        <span className={styles.statusPending}>Pendiente</span>
                    </div>
                    <div className={styles.documentItem}>
                        <Shield size={20} />
                        <span>SOAT</span>
                        <span className={styles.statusPending}>Pendiente</span>
                    </div>
                    <div className={styles.documentItem}>
                        <FileText size={20} />
                        <span>Licencia de Conducción</span>
                        <span className={styles.statusPending}>Pendiente</span>
                    </div>
                </div>
                <p className={styles.documentNote}>
                    Al continuar, podrá cargar los documentos requeridos para completar el registro.
                </p>
            </div>

            <div className={styles.summaryActions}>
                <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={styles.editButton}
                >
                    <Edit2 size={18} />
                    Editar información
                </button>
                <div className={styles.mainActions}>
                    
                    
                </div>
            </div>
        </div>
    </div>
);

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground} />
      <div className={styles.content}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className={styles.title}>Registro de Vehículo</h1>
        </div>

        <form className={styles.form}>
          {currentStep === 1 && renderVehicleForm()}
          {currentStep === 3 && renderSummary()}

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={handleBack}
              className={styles.secondaryButton}
            >
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </button>
            <button 
              type="button"
              onClick={handleNext}
              className={styles.primaryButton}
            >
              {currentStep === 3 ? 'Finalizar Registro' : 'Siguiente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/RegistrarVehiculo/')({
  component: VehicleRegistration,
});

export default VehicleRegistration;


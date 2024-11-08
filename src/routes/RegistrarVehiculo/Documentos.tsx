// src/routes/RegistrarVehiculo/Documentos/index.tsx
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { 
  FileText, 
  Camera, 
  ArrowLeft, 
  Calendar, 
  Info, 
  Shield,
  Check,
  AlertCircle 
} from 'lucide-react';
import styles from './Documentos.module.css';

type DocumentType = 'property' | 'insurance' | 'identification';

interface DocumentData {
  documentType: DocumentType;
  documentNumber: string;
  expeditionDate: string;
  expiryDate: string;
  expeditionCity: string;
  photo: string | null;
  // Campos específicos para Tarjeta de Propiedad
  brand?: string;
  model?: string;
  engineNumber?: string;
  vin?: string;
  // Campos específicos para SOAT
  insuranceCompany?: string;
  coverageType?: string;
  coverageAmount?: string;
  policyNumber?: string;
  // Campos específicos para Identificación
  idType?: string;
  fullName?: string;
  nationality?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const DocumentsForm: React.FC = () => {
  const navigate = useNavigate();
  const { type = 'property' } = useSearch({
    from: '/RegistrarVehiculo/Documentos',
    strict: true
  });

  const [formData, setFormData] = useState<DocumentData>({
    documentType: type,
    documentNumber: '',
    expeditionDate: '',
    expiryDate: '',
    expeditionCity: '',
    photo: null,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBack = () => {
    if (isSubmitting) return;
    navigate({ to: '/RegistrarVehiculo' });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        setErrors(prev => ({
          ...prev,
          photo: 'La imagen no debe exceder 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({
          ...prev,
          photo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validaciones comunes
    if (!formData.documentNumber) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }
    if (!formData.expeditionDate) {
      newErrors.expeditionDate = 'La fecha de expedición es requerida';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'La fecha de vencimiento es requerida';
    }
    if (!formData.photo) {
      newErrors.photo = 'La foto del documento es requerida';
    }

    // Validaciones específicas por tipo
    switch (type) {
      case 'property':
        if (!formData.engineNumber) {
          newErrors.engineNumber = 'El número de motor es requerido';
        }
        if (!formData.vin) {
          newErrors.vin = 'El número VIN es requerido';
        }
        break;
      case 'insurance':
        if (!formData.insuranceCompany) {
          newErrors.insuranceCompany = 'La compañía aseguradora es requerida';
        }
        if (!formData.policyNumber) {
          newErrors.policyNumber = 'El número de póliza es requerido';
        }
        break;
      case 'identification':
        if (!formData.idType) {
          newErrors.idType = 'El tipo de identificación es requerido';
        }
        if (!formData.fullName) {
          newErrors.fullName = 'El nombre completo es requerido';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulación de envío a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);

      // Esperar un momento para mostrar el éxito
      setTimeout(() => {
        navigate({ 
          to: '/RegistrarVehiculo',
          search: { documentUpdated: 'true' }
        });
      }, 1000);

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar el documento. Por favor intente nuevamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPropertyFields = () => (
    <>
     

      
    </>
  );

  const renderInsuranceFields = () => (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Shield size={16} />
          Compañía Aseguradora
        </label>
        <input
          type="text"
          name="insuranceCompany"
          value={formData.insuranceCompany || ''}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.insuranceCompany ? styles.inputError : ''}`}
          placeholder="Nombre de la aseguradora"
        />
        {errors.insuranceCompany && (
          <span className={styles.errorText}>{errors.insuranceCompany}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Shield size={16} />
          Número de Póliza
        </label>
        <input
          type="text"
          name="policyNumber"
          value={formData.policyNumber || ''}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.policyNumber ? styles.inputError : ''}`}
          placeholder="Número de póliza"
        />
        {errors.policyNumber && (
          <span className={styles.errorText}>{errors.policyNumber}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Info size={16} />
          Tipo de Cobertura
        </label>
        <select
          name="coverageType"
          value={formData.coverageType || ''}
          onChange={handleInputChange}
          className={styles.select}
        >
          <option value="">Seleccione tipo de cobertura</option>
          <option value="full">Cobertura Total</option>
          <option value="basic">Cobertura Básica</option>
          <option value="extended">Cobertura Extendida</option>
        </select>
      </div>
    </>
  );

  const renderIdentificationFields = () => (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Info size={16} />
          Tipo de Identificación
        </label>
        <select
          name="idType"
          value={formData.idType || ''}
          onChange={handleInputChange}
          className={`${styles.select} ${errors.idType ? styles.inputError : ''}`}
        >
          <option value="">Seleccione tipo</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="PA">Pasaporte</option>
        </select>
        {errors.idType && (
          <span className={styles.errorText}>{errors.idType}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Info size={16} />
          Nombre Completo
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleInputChange}
          className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
          placeholder="Nombre completo"
        />
        {errors.fullName && (
          <span className={styles.errorText}>{errors.fullName}</span>
        )}
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground} />
      
      <div className={styles.header}>
        <button 
          onClick={handleBack} 
          className={styles.backButton}
          disabled={isSubmitting}
        >
              {/* Flecha para volver a RegistrarVehicle */}
          <ArrowLeft size={24} />

        </button>
        <h1 className={styles.title}>
          {type === 'property' && 'Tarjeta de Propiedad'}
          {type === 'insurance' && 'SOAT'}
          {type === 'identification' && 'Identificación'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* Campos comunes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={16} />
              Número de Documento
            </label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.documentNumber ? styles.inputError : ''}`}
              placeholder="Ingrese el número de documento"
            />
            {errors.documentNumber && (
              <span className={styles.errorText}>{errors.documentNumber}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={16} />
              Fecha de Expedición
            </label>
            <input
              type="date"
              name="expeditionDate"
              value={formData.expeditionDate}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.expeditionDate ? styles.inputError : ''}`}
            />
            {errors.expeditionDate && (
              <span className={styles.errorText}>{errors.expeditionDate}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={16} />
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.expiryDate ? styles.inputError : ''}`}
            />
            {errors.expiryDate && (
              <span className={styles.errorText}>{errors.expiryDate}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Info size={16} />
              Ciudad de Expedición
            </label>
            <input
              type="text"
              name="expeditionCity"
              value={formData.expeditionCity}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Ciudad donde se expidió"
            />
          </div>

          {/* Campos específicos según el tipo de documento */}
          {type === 'property' && renderPropertyFields()}
          {type === 'insurance' && renderInsuranceFields()}
          {type === 'identification' && renderIdentificationFields()}
        </div>

        {/* Sección de foto del documento */}
        <div className={styles.photoUpload}>
          <div className={`${styles.photoPreview} ${errors.photo ? styles.photoPreviewError : ''}`}>
            {photoPreview ? (
              <img src={photoPreview} alt="Document preview" className={styles.previewImage} />
            ) : (
              <Camera size={40} className={styles.cameraIcon} />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className={styles.photoInput}
            id="document-photo"
          />
          <label htmlFor="document-photo" className={styles.photoLabel}>
            {photoPreview ? 'Cambiar foto' : 'Agregar foto del documento'}
          </label>
          {errors.photo && (
            <span className={styles.errorText}>{errors.photo}</span>
          )}
        </div>

        {/* Mensaje de error general */}
        {errors.submit && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.secondaryButton}
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={`${styles.primaryButton} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.loadingText}>
                <span className={styles.loadingSpinner}></span>
                Guardando...
              </span>
            ) : submitSuccess ? (
              <span className={styles.successText}>
                <Check size={20} />
                Guardado
              </span>
            ) : (
              'Guardar Documento'
            )}
          </button>
        </div>
      </form>

      {/* Mensaje de éxito flotante */}
      {submitSuccess && (
        <div className={styles.successMessage}>
          <Check size={20} />
          <span>Documento guardado exitosamente</span>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/RegistrarVehiculo/Documentos')({
  component: DocumentsForm,
  validateSearch: (search: Record<string, unknown>): { type: DocumentType } => ({
    type: (search.type as DocumentType) || 'property'
  })
});

export default DocumentsForm;
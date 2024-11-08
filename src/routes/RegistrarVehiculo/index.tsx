// src/routes/RegistrarVehiculo/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Car, Shield, Calendar, Info, FileText, Camera, Key, ArrowLeft } from 'lucide-react';
import styles from './index.module.css';

interface VehicleDocument {
  id: string;
  type: 'property' | 'insurance' | 'identification';
  complete: boolean;
  file?: File;
  previewUrl?: string;
  metadata?: Record<string, any>;
}

interface FormData {
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  vin: string;
  engineNumber: string;
  transmission: string;
  fuelType: string;
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;
  startDate: string;
  endDate: string;
  coverage: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  registrationExpiryDate: string;
  hasDocuments: boolean;
  documents: {
    property?: VehicleDocument;
    insurance?: VehicleDocument;
    identification?: VehicleDocument;
  };
}

const DOCUMENT_TYPES = [
  { 
    id: 'property' as const, 
    title: 'Tarjeta de Propiedad', 
    icon: FileText,
    required: true
  },
  { 
    id: 'insurance' as const, 
    title: 'SOAT', 
    icon: Shield,
    required: true
  },
  { 
    id: 'identification' as const, 
    title: 'Identificación', 
    icon: FileText,
    required: true
  }
] as const;

const VehicleRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    engineNumber: '',
    transmission: '',
    fuelType: '',
    insuranceCompany: '',
    policyNumber: '',
    policyType: '',
    startDate: '',
    endDate: '',
    coverage: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    registrationExpiryDate: '',
    hasDocuments: false,
    documents: {},
  });

  const [activeSection, setActiveSection] = useState<string>('vehicle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    navigate({ to: '/perfil' });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Limpiar error cuando el usuario modifica el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setPhotoPreview(result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentNavigation = (docType: typeof DOCUMENT_TYPES[number]['id']) => {
    navigate({
      to: '/RegistrarVehiculo/Documentos',
      search: { type: docType }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar campos requeridos del vehículo
    if (!formData.brand) newErrors.brand = 'La marca es requerida';
    if (!formData.model) newErrors.model = 'El modelo es requerido';
    if (!formData.year) newErrors.year = 'El año es requerido';
    if (!formData.licensePlate) newErrors.licensePlate = 'La placa es requerida';

    // Validar documentos requeridos
    DOCUMENT_TYPES.forEach(doc => {
      if (doc.required && !formData.documents[doc.id]) {
        newErrors[`document_${doc.id}`] = `El documento ${doc.title} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      // Si hay errores, mostrar la sección correspondiente
      if (Object.keys(errors).some(key => key.startsWith('document_'))) {
        setActiveSection('documents');
      }
      return;
    }

    try {
      // Aquí iría la lógica para enviar los datos
      // await submitVehicleData(formData);
      console.log('Form Data:', formData);
      navigate({ to: '/perfil' });
    } catch (error) {
      console.error('Error al enviar datos:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar los datos. Por favor intente nuevamente.'
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground} />
      
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
       
        </button>
        <h1 className={styles.title}>Registro de Vehículo</h1>
      </div>

      <div className={styles.navigationTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeSection === 'vehicle' ? styles.activeTab : ''}`}
          onClick={() => setActiveSection('vehicle')}
        >
          <Car size={20} />
          <span>Vehículo</span>
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeSection === 'documents' ? styles.activeTab : ''}`}
          onClick={() => setActiveSection('documents')}
        >
          <FileText size={20} />
          <span>Documentos</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sección de Vehículo */}
        <div className={`${styles.section} ${activeSection === 'vehicle' ? styles.activeSection : ''}`}>
          <div className={styles.sectionHeader}>
            <Car className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Información del Vehículo</h2>
          </div>

          <div className={styles.photoUpload}>
            <div className={styles.photoPreview}>
              {photoPreview ? (
                <img src={photoPreview} alt="Vehicle preview" className={styles.previewImage} />
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
              Agregar foto del vehículo
            </label>
          </div>

          <div className={styles.formGrid}>
           

            {/* ... (resto de los campos del formulario con el mismo patrón) ... */}
            <div className={styles.formGrid}>
  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Car size={16} />
      Marca
    </label>
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
    <label className={styles.label}>
      <Info size={16} />
      Modelo
    </label>
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
    <label className={styles.label}>
      <Calendar size={16} />
      Año
    </label>
    <input
      type="number"
      name="year"
      value={formData.year}
      onChange={handleInputChange}
      className={`${styles.input} ${errors.year ? styles.inputError : ''}`}
      placeholder="ej. 2022"
      min="1900"
      max="2024"
    />
    {errors.year && <span className={styles.errorText}>{errors.year}</span>}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Key size={16} />
      Placa
    </label>
    <input
      type="text"
      name="licensePlate"
      value={formData.licensePlate}
      onChange={handleInputChange}
      className={`${styles.input} ${errors.licensePlate ? styles.inputError : ''}`}
      placeholder="ej. ABC-123"
    />
    {errors.licensePlate && <span className={styles.errorText}>{errors.licensePlate}</span>}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Info size={16} />
      Número de VIN
    </label>
    <input
      type="text"
      name="vin"
      value={formData.vin}
      onChange={handleInputChange}
      className={`${styles.input} ${errors.vin ? styles.inputError : ''}`}
      placeholder="ej. 1HGCM82633A123456"
    />
    {errors.vin && <span className={styles.errorText}>{errors.vin}</span>}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Info size={16} />
      Número de Motor
    </label>
    <input
      type="text"
      name="engineNumber"
      value={formData.engineNumber}
      onChange={handleInputChange}
      className={`${styles.input} ${errors.engineNumber ? styles.inputError : ''}`}
      placeholder="ej. ENG123456"
    />
    {errors.engineNumber && <span className={styles.errorText}>{errors.engineNumber}</span>}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Info size={16} />
      Transmisión
    </label>
    <select
      name="transmission"
      value={formData.transmission}
      onChange={handleInputChange}
      className={`${styles.select} ${errors.transmission ? styles.inputError : ''}`}
    >
      <option value="">Seleccione tipo</option>
      <option value="manual">Manual</option>
      <option value="automatica">Automática</option>
    </select>
    {errors.transmission && <span className={styles.errorText}>{errors.transmission}</span>}
  </div>

  <div className={styles.formGroup}>
    <label className={styles.label}>
      <Info size={16} />
      Tipo de Combustible
    </label>
    <select
      name="fuelType"
      value={formData.fuelType}
      onChange={handleInputChange}
      className={`${styles.select} ${errors.fuelType ? styles.inputError : ''}`}
    >
      <option value="">Seleccione tipo</option>
      <option value="gasolina">Gasolina</option>
      <option value="diesel">Diésel</option>
      <option value="electrico">Eléctrico</option>
      <option value="hibrido">Híbrido</option>
    </select>
    {errors.fuelType && <span className={styles.errorText}>{errors.fuelType}</span>}
  </div>
</div>

          </div>
        </div>

        {/* Sección de Documentos */}
        <div className={`${styles.section} ${activeSection === 'documents' ? styles.activeSection : ''}`}>
          <div className={styles.sectionHeader}>
            <FileText className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Documentos Requeridos</h2>
          </div>

          <div className={styles.documentUpload}>
            <div className={styles.uploadGrid}>
              {DOCUMENT_TYPES.map((doc) => (
                <div key={doc.id} className={styles.uploadCard}>
                  <div className={styles.uploadCardContent}>
                    <doc.icon size={24} className={styles.uploadIcon} />
                    <span className={styles.uploadCardTitle}>{doc.title}</span>
                    <button 
                      type="button" 
                      className={`${styles.uploadButton} ${formData.documents[doc.id]?.complete ? styles.uploadButtonComplete : ''}`}
                      onClick={() => handleDocumentNavigation(doc.id)}
                    >
                      {formData.documents[doc.id]?.complete ? 'Editar documento' : 'Agregar documento'}
                    </button>
                    {errors[`document_${doc.id}`] && (
                      <span className={styles.errorText}>{errors[`document_${doc.id}`]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.secondaryButton}
            onClick={handleBack}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.primaryButton}>
            Registrar Vehículo
          </button>
        </div>

        {errors.submit && (
          <div className={styles.errorMessage}>
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
};

export const Route = createFileRoute('/RegistrarVehiculo/')({
  component: VehicleRegistration,
});

export default VehicleRegistration;
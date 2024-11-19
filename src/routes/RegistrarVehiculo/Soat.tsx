import React, { useState } from 'react';
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
  Ambulance,
  Heart,
  Car
} from 'lucide-react';
import { SoatFormData, INSURANCE_COMPANIES, COVERAGE_TYPES } from '../../types/SoatTypes';
import styles from './Soat.module.css';

const Soat: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SoatFormData>({
    documentNumber: '',
    expeditionDate: '',
    expiryDate: '',
    expeditionCity: '',
    insuranceCompany: '',
    policyNumber: '',
    coverageType: 'basic',
    totalCoverage: '',
    deathCoverage: '',
    medicalCoverage: '',
    disabilityCoverage: '',
    transportCoverage: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones específicas para SOAT
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentNumber) {
      newErrors.documentNumber = 'El número de póliza es requerido';
    } else if (!/^\d{10,14}$/.test(formData.documentNumber)) {
      newErrors.documentNumber = 'Número de póliza inválido';
    }

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

    if (!formData.policyNumber) {
      newErrors.policyNumber = 'El número de póliza es requerido';
    }

    if (!formData.totalCoverage) {
      newErrors.totalCoverage = 'El valor total de cobertura es requerido';
    }

    // Validar montos de coberturas específicas
    const requiredCoverages = [
      { field: 'deathCoverage', label: 'La cobertura por muerte' },
      { field: 'medicalCoverage', label: 'La cobertura médica' },
      { field: 'disabilityCoverage', label: 'La cobertura por incapacidad' },
      { field: 'transportCoverage', label: 'La cobertura de transporte' }
    ];

    requiredCoverages.forEach(({ field, label }) => {
      if (!formData[field as keyof SoatFormData]) {
        newErrors[field] = `${label} es requerida`;
      }
    });

    // Validar archivos
    if (!formData.frontFile) {
      newErrors.frontFile = 'La foto frontal del SOAT es requerida';
    }
    if (!formData.backFile) {
      newErrors.backFile = 'La foto posterior del SOAT es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [`${side}File`]: file,
        [`${side}Preview`]: reader.result as string
      }));
      
      if (errors[`${side}File`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`${side}File`];
          return newErrors;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simular envío a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate({ 
        to: '/RegistrarVehiculo/DocumentsRequired',
        search: { documentType: 'soat', status: 'completed' }
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar el documento. Por favor intente nuevamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/RegistrarVehiculo/DocumentsRequired' });
  };



  return (
    <div className={styles.container}>
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
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número de póliza SOAT"
                  disabled={isSubmitting}
                />
                {errors.policyNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.policyNumber}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} className={styles.labelIcon} />
                  Fecha de Expedición
                </label>
                <input
                  type="date"
                  name="expeditionDate"
                  value={formData.expeditionDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
                {errors.expeditionDate && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.expeditionDate}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} className={styles.labelIcon} />
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
                {errors.expiryDate && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.expiryDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información de Coberturas */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Shield className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información de Coberturas</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Shield size={16} className={styles.labelIcon} />
                  Tipo de Cobertura
                </label>
                <select
                  name="coverageType"
                  value={formData.coverageType}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  {COVERAGE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Heart size={16} className={styles.labelIcon} />
                  Cobertura por Muerte
                </label>
                <input
                  type="text"
                  name="deathCoverage"
                  value={formData.deathCoverage}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Cobertura por muerte y gastos funerarios"
                  disabled={isSubmitting}
                />
                {errors.deathCoverage && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.deathCoverage}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Ambulance size={16} className={styles.labelIcon} />
                  Gastos Médicos
                </label>
                <input
                  type="text"
                  name="medicalCoverage"
                  value={formData.medicalCoverage}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Cobertura de gastos médicos"
                  disabled={isSubmitting}
                />
                {errors.medicalCoverage && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.medicalCoverage}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Shield size={16} className={styles.labelIcon} />
                  Incapacidad Permanente
                </label>
                <input
                  type="text"
                  name="disabilityCoverage"
                  value={formData.disabilityCoverage}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Cobertura por incapacidad permanente"
                  disabled={isSubmitting}
                />
                {errors.disabilityCoverage && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.disabilityCoverage}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Car size={16} className={styles.labelIcon} />
                  Gastos de Transporte
                </label>
                <input
                  type="text"
                  name="transportCoverage"
                  value={formData.transportCoverage}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Cobertura de gastos de transporte"
                  disabled={isSubmitting}
                />
                {errors.transportCoverage && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.transportCoverage}
                  </span>
                )}
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
                  disabled={isSubmitting}
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
              <ArrowLeft size={20} />
              Volver
            </button>
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
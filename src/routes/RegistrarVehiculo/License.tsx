import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Camera,
  Calendar,
  User,
  Heart,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { DocumentFormData, LICENSE_CATEGORIES, BLOOD_TYPES } from '../../types/DocumentTypes';
import styles from './License.module.css';

const License: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: 'license',
    documentNumber: '',
    expeditionDate: '',
    expiryDate: '',
    expeditionCity: '',
    firstName: '',
    lastName: '',
    licenseCategory: 'B1',
    bloodType: 'O+',
    frontFile: undefined,
    backFile: undefined,
    frontPreview: undefined,
    backPreview: undefined
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.documentNumber?.trim()) {
      newErrors.documentNumber = 'El número de licencia es requerido';
    }
    if (!formData.expeditionDate) {
      newErrors.expeditionDate = 'La fecha de expedición es requerida';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'La fecha de vencimiento es requerida';
    }
    if (!formData.expeditionCity?.trim()) {
      newErrors.expeditionCity = 'La ciudad de expedición es requerida';
    }
    if (!formData.frontFile) {
      newErrors.frontFile = 'La foto frontal es requerida';
    }
    if (!formData.backFile) {
      newErrors.backFile = 'La foto posterior es requerida';
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

    const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [`${side}File`]: 'Formato no válido. Use JPG, PNG o HEIC'
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate({ 
        to: '/RegistrarVehiculo/DocumentsRequired',
        search: { documentType: 'license', status: 'completed' }
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar la licencia. Por favor intente nuevamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground} />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <button 
            onClick={() => navigate({ to: '/RegistrarVehiculo/DocumentsRequired' })} 
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h1 className={styles.title}>Licencia de Conducción</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información Personal */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <User className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información Personal</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={16} className={styles.labelIcon} />
                  Nombres
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nombres completos"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={16} className={styles.labelIcon} />
                  Apellidos
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Apellidos completos"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>
          </div>

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
                  Categoría
                </label>
                <select
                  name="licenseCategory"
                  value={formData.licenseCategory}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  {LICENSE_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Heart size={16} className={styles.labelIcon} />
                  Tipo de Sangre
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  accept="image/jpeg,image/png,image/heic"
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
                  disabled={isSubmitting}
                />
                <label htmlFor="back-photo" className={styles.photoLabel}>
                  <Camera size={16} />
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
              onClick={() => navigate({ to: '/RegistrarVehiculo/DocumentsRequired' })}
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
                  Guardar Licencia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export const Route = createFileRoute('/RegistrarVehiculo/License')({
    component: License,
})
export default License;
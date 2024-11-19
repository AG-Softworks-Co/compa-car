import React, { useState } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { 
  ArrowLeft,
  Camera,
  FileText,
  Calendar,
  Settings,
  Car,
  RotateCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { PropertyCardData, BODY_TYPES } from '../../types/PropertyCardTypes';
import styles from './PropertyCar.module.css';

const PropertyCard: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyCardData>({
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    bodyType: 'sedan',
    engineNumber: '',
    chassisNumber: '',
    vinNumber: '',
    documentNumber: '',
    expeditionDate: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones del documento
    if (!formData.documentNumber) {
      newErrors.documentNumber = 'El número de la licencia es requerido';
    }
    if (!formData.expeditionDate) {
      newErrors.expeditionDate = 'La fecha de expedición es requerida';
    }

    // Validaciones del vehículo
    if (!formData.brand) {
      newErrors.brand = 'La marca es requerida';
    }
    if (!formData.model) {
      newErrors.model = 'La línea es requerida';
    }
    if (!formData.year) {
      newErrors.year = 'El modelo es requerido';
    }
    if (!formData.plate) {
      newErrors.plate = 'La placa es requerida';
    }
    if (!formData.color) {
      newErrors.color = 'El color es requerido';
    }
    if (!formData.engineNumber) {
      newErrors.engineNumber = 'El número de motor es requerido';
    }
    if (!formData.chassisNumber) {
      newErrors.chassisNumber = 'El número de chasis es requerido';
    }
    if (!formData.vinNumber) {
      newErrors.vinNumber = 'El número VIN es requerido';
    }

    // Validación de fotos
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate({ 
        to: '/RegistrarVehiculo/DocumentsRequired',
        search: { documentType: 'property', status: 'completed' }
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error al guardar el documento'
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
          <button onClick={() => navigate({ to: '/RegistrarVehiculo/DocumentsRequired' })} className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h1 className={styles.title}>Tarjeta de Propiedad</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información del Documento */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información del Documento</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                  Número de Licencia
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número de la licencia de tránsito"
                  disabled={isSubmitting}
                />
                {errors.documentNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.documentNumber}
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
                  disabled={isSubmitting}
                />
                {errors.expeditionDate && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.expeditionDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Car className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información del Vehículo</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Car size={16} className={styles.labelIcon} />
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Marca del vehículo"
                  disabled={isSubmitting}
                />
                {errors.brand && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.brand}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Car size={16} className={styles.labelIcon} />
                  Línea
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Línea del vehículo"
                  disabled={isSubmitting}
                />
                {errors.model && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.model}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} className={styles.labelIcon} />
                  Modelo
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Año del vehículo"
                  disabled={isSubmitting}
                />
                {errors.year && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.year}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                  Placa
                </label>
                <input
                  type="text"
                  name="plate"
                  value={formData.plate}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Placa del vehículo"
                  disabled={isSubmitting}
                />
                {errors.plate && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.plate}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Car size={16} className={styles.labelIcon} />
                  Clase de Vehículo
                </label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className={styles.select}
                  disabled={isSubmitting}
                >
                  {BODY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Color del vehículo"
                  disabled={isSubmitting}
                />
                {errors.color && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.color}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Settings className={styles.sectionIcon} size={24} />
              <h2 className={styles.sectionTitle}>Información Técnica</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Settings size={16} className={styles.labelIcon} />
                  Número de Motor
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número de motor"
                  disabled={isSubmitting}
                />
                {errors.engineNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.engineNumber}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Settings size={16} className={styles.labelIcon} />
                  Número de Chasis
                </label>
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número de chasis"
                  disabled={isSubmitting}
                />
                {errors.chassisNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.chassisNumber}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} className={styles.labelIcon} />
                  Número VIN
                </label>
                <input
                  type="text"
                  name="vinNumber"
                  value={formData.vinNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Número VIN"
                  disabled={isSubmitting}
                />
                {errors.vinNumber && (
                  <span className={styles.errorText}>
                    <AlertCircle size={14} />
                    {errors.vinNumber}
                  </span>
                )}
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
                  Guardar Documento
                </>
              )}
            </button>
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
export type DocumentType = 'property' | 'insurance' | 'license';

export interface DocumentFormData {
  documentType: DocumentType;
  documentNumber: string;
  expeditionDate: string;
  expiryDate: string;
  expeditionCity: string;
  frontFile?: File;
  backFile?: File;
  frontPreview?: string;
  backPreview?: string;
  // Campos específicos para cada tipo de documento
  // Tarjeta de Propiedad
  brand?: string;
  model?: string;
  engineNumber?: string;
  vin?: string;
  // SOAT
  insuranceCompany?: string;
  policyNumber?: string;
  coverageType?: string;
  // Licencia
  licenseCategory?: string;
  restrictions?: string;
  bloodType?: string;
  organDonor?: boolean;
  firstName?: string;
  lastName?: string;
  identificationNumber?: string;
  address?: string;
}

export const LICENSE_CATEGORIES = [
  { value: 'A1', label: 'A1 - Motocicletas hasta 125 cc' },
  { value: 'A2', label: 'A2 - Motocicletas más de 125 cc' },
  { value: 'B1', label: 'B1 - Automóviles particulares' },
  { value: 'B2', label: 'B2 - Camiones y buses particulares' },
  { value: 'C1', label: 'C1 - Automóviles servicio público' },
  { value: 'C2', label: 'C2 - Camiones servicio público' }
] as const;

export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
] as const;

export const COVERAGE_TYPES = [
  { value: 'basic', label: 'Básica' },
  { value: 'extended', label: 'Extendida' },
  { value: 'full', label: 'Total' }
] as const;
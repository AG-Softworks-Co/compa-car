// types/PropertyCardTypes.ts

export const BODY_TYPES = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'Camioneta' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' }
] as const;

export interface PropertyCardData {
  // Datos del vehículo
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
  bodyType: string;
  engineNumber: string;
  chassisNumber: string;
  vinNumber: string;
  // Datos del documento
  documentNumber: string;
  expeditionDate: string;
  frontFile?: File;
  backFile?: File;
  frontPreview?: string;
  backPreview?: string;
}
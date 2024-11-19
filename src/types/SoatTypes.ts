export interface SoatFormData {
    // Información del documento
    documentNumber: string; // Número de póliza SOAT
    expeditionDate: string;
    expiryDate: string;
    expeditionCity: string;
  
    // Información de la aseguradora
    insuranceCompany: string;
    policyNumber: string;
  
    // Información de cobertura
    coverageType: 'basic' | 'full';
    totalCoverage: string; // Valor total de la cobertura
    
    // Coberturas específicas
    deathCoverage: string; // Muerte y gastos funerarios
    medicalCoverage: string; // Gastos médicos
    disabilityCoverage: string; // Incapacidad permanente
    transportCoverage: string; // Gastos de transporte
  
    // Archivos del documento
    frontFile?: File;
    backFile?: File;
    frontPreview?: string;
    backPreview?: string;
  }
  
  export const INSURANCE_COMPANIES = [
    { value: 'seguros_estado', label: 'Seguros del Estado' },
    { value: 'sura', label: 'Seguros Sura' },
    { value: 'bolivar', label: 'Seguros Bolívar' },
    { value: 'mapfre', label: 'Mapfre Seguros' },
    { value: 'liberty', label: 'Liberty Seguros' },
    { value: 'allianz', label: 'Allianz Seguros' },
    { value: 'axa_colpatria', label: 'AXA Colpatria' },
    { value: 'previsora', label: 'Previsora Seguros' },
  ] as const;
  
  export const COVERAGE_TYPES = [
    { 
      value: 'basic', 
      label: 'Cobertura Básica',
      description: 'Cobertura mínima requerida por ley'
    },
    { 
      value: 'full', 
      label: 'Cobertura Total',
      description: 'Cobertura ampliada con beneficios adicionales'
    }
  ] as const;
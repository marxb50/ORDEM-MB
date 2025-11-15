
export enum ProfileType {
  FUNCIONARIO = 'Funcionário',
  FISCAL_SELIM = 'Fiscal SELIM',
  EMPRESA_MB = 'Empresa MB',
}

export enum SolicitationStatus {
  ENVIADO_PARA_SELIM = 'ENVIADO PARA SELIM',
  RECUSADO = 'RECUSADO',
  ENVIADO_PARA_MB = 'ENVIADO PARA MB',
  INICIADA = 'INICIADA',
  PENDENTE = 'PENDENTE',
  FINALIZADA = 'FINALIZADA',
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Storing plain text password for simplicity, in real app use hash
  profileType: ProfileType;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
}

export interface AddressData {
  road: string;
  suburb: string;
  city: string;
  postcode: string;
  country: string;
  display_name: string;
}

export interface StatusUpdate {
  status: SolicitationStatus;
  updatedBy: string; // User name
  timestamp: string;
}

export interface Solicitation {
  id: string;
  employeeId: string;
  employeeName: string;
  photoDataUrl: string;
  geolocation: GeolocationData;
  address: AddressData | null;
  observation: string;
  createdAt: string;
  statusHistory: StatusUpdate[];
  currentStatus: SolicitationStatus;
}

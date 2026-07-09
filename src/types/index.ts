// Tipos que reflejan los DTOs del backend (.NET) - mantener sincronizados.

export type UserRole = 'admin' | 'driver'

export type AlertStatus = 'Green' | 'Yellow' | 'Red'

export type VehicleStatus = 'Active' | 'Maintenance' | 'Inactive'

export interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  manufactureYear: number
  color: string | null
  currentMileage: number
  assignedDriverId: string | null
  assignedDriverName: string | null
  status: VehicleStatus
  overallAlertStatus: AlertStatus
}

export interface CreateVehicleRequest {
  licensePlate: string
  brand: string
  model: string
  manufactureYear: number
  color?: string | null
  currentMileage: number
  assignedDriverId?: string | null
}

export interface UpdateVehicleRequest {
  brand: string
  model: string
  color?: string | null
  currentMileage: number
  assignedDriverId?: string | null
  status: VehicleStatus
}

export interface MaintenanceStatus {
  vehicleId: string
  maintenanceTypeId: string
  maintenanceTypeName: string
  currentMileage: number
  lastServiceMileage: number
  lastServiceDate: string | null
  intervalKm: number
  wearPercentage: number
  status: AlertStatus
  kmRemaining: number
}

export interface CreateMaintenanceLogRequest {
  vehicleId: string
  maintenanceTypeId: string
  mileageAtService: number
  serviceDate: string
  cost: number
  notes?: string | null
}

export interface DocumentStatus {
  vehicleId: string
  documentId: string
  documentType: 'Soat' | 'RevisionTecnica' | 'TarjetaPropiedad'
  expirationDate: string
  daysUntilExpiration: number
  status: AlertStatus
}

export type DocumentType = 'Soat' | 'RevisionTecnica' | 'TarjetaPropiedad'

export interface VehicleDocument {
  id: string
  vehicleId: string
  documentType: DocumentType
  issueDate: string
  expirationDate: string
  fileHashSha256: string
  status: AlertStatus
  daysUntilExpiration: number
}

export interface VehiclePhoto {
  id: string
  vehicleId: string
  url: string
  isPrimary: boolean
}

export interface VehicleAlertSummary {
  vehicleId: string
  licensePlate: string
  overallStatus: AlertStatus
  maintenanceItems: MaintenanceStatus[]
  documentItems: DocumentStatus[]
}

export interface AppUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
  phone: string | null
}

export interface InviteUserRequest {
  fullName: string
  email: string
  role: UserRole
  phone?: string | null
}

export interface DashboardSummary {
  totalVehicles: number
  greenCount: number
  yellowCount: number
  redCount: number
  estimatedUpcomingCost: number
  urgentVehicles: VehicleAlertSummary[]
}

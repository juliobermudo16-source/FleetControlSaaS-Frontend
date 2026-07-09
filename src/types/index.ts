// Tipos que reflejan los DTOs del backend (.NET) - mantener sincronizados.

export type UserRole = 'admin' | 'driver'

export type AlertStatus = 'Green' | 'Yellow' | 'Red'

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
  status: 'Active' | 'Maintenance' | 'Inactive'
  overallAlertStatus: AlertStatus
}

export interface MaintenanceStatus {
  vehicleId: string
  maintenanceTypeId: string
  maintenanceTypeName: string
  currentMileage: number
  lastServiceMileage: number
  intervalKm: number
  wearPercentage: number
  status: AlertStatus
  kmRemaining: number
}

export interface DocumentStatus {
  vehicleId: string
  documentId: string
  documentType: 'Soat' | 'RevisionTecnica' | 'TarjetaPropiedad'
  expirationDate: string
  daysUntilExpiration: number
  status: AlertStatus
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

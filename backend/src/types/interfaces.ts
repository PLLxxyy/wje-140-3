export type Role = 'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'Mechanic';
export interface AuthUser { id: number; role: Role; name: string; }
export interface ApiResult<T> { data: T; message: string; }

export interface CostSummary {
  id: number;
  vehicleId: number;
  plateNo: string;
  month: string;
  fuelTotal: number;
  maintenanceTotal: number;
  tollTotal: number;
  laborTotal: number;
  fixedCost: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
}

export interface FuelCostDetail {
  id: number;
  date: string;
  liters: number;
  unitPrice: number;
  totalAmount: number;
  station: string;
  paymentMethod: string;
  mileage: number;
  driverId: number;
  dispatchOrderId?: number;
}

export interface MaintenanceCostDetail {
  id: number;
  date: string;
  maintenanceType: string;
  item: string;
  cost: number;
  vendor: string;
  status: string;
}

export interface TollCostDetail {
  id: number;
  orderNo: string;
  origin: string;
  destination: string;
  estimatedTollCost: number;
  planDepartAt: string;
  status: string;
}

export interface CostDetailResponse {
  vehicleId: number;
  plateNo: string;
  month: string;
  fuelTotal: number;
  maintenanceTotal: number;
  tollTotal: number;
  laborTotal: number;
  fixedCost: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  fuelDetails: FuelCostDetail[];
  maintenanceDetails: MaintenanceCostDetail[];
  tollDetails: TollCostDetail[];
}

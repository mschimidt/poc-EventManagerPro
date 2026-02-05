
export interface FixedCost {
  id?: string;
  name: string;
  amount: number;
  monthYear?: string; // Format: YYYY-MM
}

export interface VariableCostItem {
  id?: string;
  name: string;
  defaultUnitCost: number; // Internal cost
  defaultUnitPrice: number; // Selling price
}

export interface SystemSettings {
  id?: string;
  occupancyRate: number; // e.g., 70 for 70%
  workingDaysPerMonth: number; // e.g., 22
}

export enum BudgetStatus {
  DRAFT = 'Orçado',
  SCHEDULED = 'Agendado',
  COMPLETED = 'Realizado',
  DECLINED = 'Declinado'
}

export interface BudgetItem {
  id: string; // generated uuid for list key
  name: string;
  quantity: number;
  unitCost: number; // cost defined by user per item
}

export interface Budget {
  id?: string;
  clientName: string;
  clientPhone: string;
  eventName: string;
  eventDate: string; // ISO date string
  guestCount: number; // Add guest count
  status: BudgetStatus;
  items: BudgetItem[];
  
  // Financial Snapshot
  totalFixedCostShare: number; // Calculated overhead
  totalVariableCost: number;
  totalSales: number;
  netProfit: number;
  marginPercent: number;
  
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
}

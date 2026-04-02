export type RetailerName = 'Amazon' | 'Target' | 'Menards';

export interface InventoryResult {
  id: string;
  retailer: RetailerName;
  title: string;
  price: number;
  currency: string;
  inStock: boolean;
  storeLocation: string;
  productUrl: string;
  imageUrl: string;
  lastUpdated: string;
}

export interface SearchRequest {
  query: string;
  zipCode: string;
}

export interface SearchResponse {
  results: InventoryResult[];
  query: string;
  zipCode: string;
  timestamp: string;
  errors: RetailerError[];
}

export interface RetailerError {
  retailer: RetailerName;
  message: string;
  code: string;
}

export interface RetailerStatus {
  retailer: RetailerName;
  status: 'pending' | 'fetching' | 'done' | 'error';
}

// API Types for Fluid Trading Systems Admin Dashboard

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  role: string;
  email: string;
}

// Admin Stats - GET /admin/stats
export interface AdminStats {
  totalLicenses: number
  activeLicenses: number
  apiKeys: number
  customers: number
  orders?: number
  revenue?: number
}

// Admin Activity - GET /admin/activity
export interface ActivityEvent {
  event: string;
  license_key?: string;
  device_id?: string;
  ip?: string;
  created_at: string;
  email?: string | null;
}

// API Key - GET /admin/apikeys
export interface ApiKeyItem {
  key: string;
  created: string;
  lastUsed: string;
}

// Products
export interface Product {
  id: string;
  name: string;
  platform: string;
  price: number;
  description: string;
  short_description?: string;
  long_description?: string;
  gallery_images?: string[];
  image_url: string;
  card_design?: string;
  plan_type?: string;
  is_test?: number;
  createdAt: string;
  files?: ProductFile[];
}

export interface CreateProductRequest {
  name: string;
  platform: string;
  price: number;
  description: string;
  short_description?: string;
  long_description?: string;
  gallery_images?: string[];
  image_url: string;
  card_design?: string | null;
  plan_type?: string | null;
  priceTier?: string | null;
  modules?: string[];
  is_test?: number;
}

// Product Files
export interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

// Licenses
export interface License {
  license_key: string
  email: string
  product_id: number
  product?: string
  plan_type: string
  status: string
  created_at: string
  expires_at?: string
  next_renewal?: string
  cancel_at?: string
}

// Customers
export interface Customer {
  email: string
  licenses: number
  created_at: string
}

export interface CustomerDetails {
  email: string
  licenses: License[]
  created_at: string
}

// Orders / Payments
export interface Order {
  id: string
  email: string
  product: string
  amount: number
  currency?: string
  status: 'paid' | 'pending' | 'failed'
  stripe_session_id?: string
  created_at: string
}

export interface CreateLicenseRequest {
  email?: string;
  product_id: string;
  plan_type: 'monthly' | 'lifetime';
}
// API Keys
export interface CreateApiKeyRequest {
  product_id: string;
}

export interface ApiKeyResponse {
  api_key: string;
  product_id: number;
  created_at: string;
  enabled?: number;
}

export interface ApiError {
  error?: string;
  message?: string;
  success?: boolean;
}

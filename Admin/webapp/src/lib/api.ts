// API client for Fluid Trading Systems Admin Dashboard

import type { 
  LoginRequest, 
  LoginResponse, 
  AdminStats,
  ActivityEvent,
  ApiKeyItem,
  Product,
  License,
  CreateLicenseRequest,
  CreateProductRequest,
  CreateApiKeyRequest,
  ApiKeyResponse,
  ProductFile,
} from '@/types/api';

// API base URL - HARDCODED to production
const API_BASE = "https://api.fluidtradingsystems.com";

// Token storage
let authToken: string | null = localStorage.getItem('fts_token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('fts_token', token);
  } else {
    localStorage.removeItem('fts_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

export function logout(): void {
  setAuthToken(null);
}

// Global API fetch helper - ALL requests must go through this
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer owner_session',
      ...(options.headers || {})
    },
    ...options
  });
}

// Standard fetch config for JSON requests with body
function apiFetchWithBody(method: string, body?: unknown): RequestInit {
  const config: RequestInit = {
    method,
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer owner_session',
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  return config;
}

// Authentication API
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch("/auth/login", apiFetchWithBody('POST', credentials));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(errorData.error || errorData.message || 'Login failed');
  }
  
  const data = await res.json();
  
  if (data.success && data.token) {
    setAuthToken(data.token);
  }
  
  return data;
}

// Analytics - GET /analytics
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await apiFetch("/analytics", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return {
        totalLicenses: 0,
        activeLicenses: 0,
        apiKeys: 0,
        customers: 0,
      };
    }
    
    const data = await res.json();
    return {
      totalLicenses: data.totalLicenses || 0,
      activeLicenses: data.activeLicenses || 0,
      apiKeys: data.apiKeys || 0,
      customers: data.customers || 0,
    };
  } catch (error) {
    return {
      totalLicenses: 0,
      activeLicenses: 0,
      apiKeys: 0,
      customers: 0,
    };
  }
}

// Admin Activity - GET /admin/activity
export async function getAdminActivity(): Promise<ActivityEvent[]> {
  try {
    const res = await apiFetch("/admin/activity", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.logs || [];
  } catch (error) {
    return [];
  }
}

// API Keys - GET /admin/apikeys
export async function getAdminApiKeys(): Promise<ApiKeyItem[]> {
  try {
    const res = await apiFetch("/admin/apikeys", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.apiKeys || [];
  } catch (error) {
    return [];
  }
}

// ========== PRODUCTS API ==========

// GET /products
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiFetch("/products", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    return [];
  }
}

// POST /products
export async function createProduct(product: CreateProductRequest): Promise<Product> {
  const res = await apiFetch("/products", apiFetchWithBody('POST', product));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create product' }));
    throw new Error(errorData.error || errorData.message || 'Failed to create product');
  }
  
  const data = await res.json();
  return data.product || data;
}

// DELETE /products/:id
export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`/products/${id}`, apiFetchWithBody('DELETE'));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to delete product' }));
    throw new Error(errorData.error || errorData.message || 'Failed to delete product');
  }
}

// ========== PRODUCT FILES API ==========
export async function getProductFiles(productId: string): Promise<ProductFile[]> {
  try {

    const res = await apiFetch(`/products/${productId}/files`, {
      method: "GET"
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return data || [];

  } catch (error) {
    return [];
  }
}


// POST /upload/product-image - Upload product card image
export async function uploadProductImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(API_BASE + "/upload/product-image", {
    method: "POST",
    headers: {
      "Authorization": "Bearer owner_session"
    },
    body: fd
  });

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  return data.url; // IMPORTANT: USE THIS VALUE
}

// POST /upload/product-gallery - Upload product gallery images
export async function uploadProductGalleryImages(productId: string, files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('product_id', productId);
    
    const res = await apiFetch("/upload/product-gallery", {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `Failed to upload ${file.name}` }));
      throw new Error(errorData.error || errorData.message || `Failed to upload ${file.name}`);
    }
    
    const data = await res.json();
    uploadedUrls.push(data.url || data.image_url);
  }
  
  return uploadedUrls;
}


export async function uploadProductFiles(
  productId: string,
  files: File[]
): Promise<ProductFile[]> {

  const uploaded: ProductFile[] = [];

  for (const file of files) {

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/products/${productId}/files`, {
      method: "POST",
      headers: {
        Authorization: "Bearer owner_session"
      },
      body: formData
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "File upload failed" }));
      throw new Error(error.error || "File upload failed");
    }

    const data = await res.json();

    
  uploaded.push({
  id: data.id || "",
  product_id: productId,
  file_name: data.file_name,
  file_url: data.file_url,
  created_at: data.created_at || new Date().toISOString()
});
  }

  return uploaded;
}


// DELETE /products/:productId/files/:fileId
export async function deleteProductFile(
  productId: string,
  fileId: string
): Promise<void> {

  const res = await apiFetch(
    `/products/${productId}/files/${fileId}`,
    apiFetchWithBody("DELETE")
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Failed to delete file" }));
    throw new Error(errorData.error || errorData.message || "Failed to delete file");
  }
}


// ========== LICENSES API ==========

// GET /licenses
export async function getLicenses(): Promise<License[]> {
  try {
    const res = await apiFetch("/licenses", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.licenses || [];
  } catch (error) {
    return [];
  }
}

// POST /licenses
export async function createLicense(licenseData: CreateLicenseRequest): Promise<License> {
  const res = await apiFetch("/licenses", apiFetchWithBody('POST', licenseData));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create license' }));
    throw new Error(errorData.error || errorData.message || 'Failed to create license');
  }
  
  const data = await res.json();
  return data.license || data;
}


// ========== CUSTOMERS API ==========

// GET /admin/customers
export async function getCustomers() {
  try {
    const res = await apiFetch("/admin/customers", apiFetchWithBody('GET'));

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.customers || [];
  } catch (error) {
    return [];
  }
}


// ========== ORDERS API ==========

// GET /admin/orders
export async function getOrders() {
  try {
    const res = await apiFetch("/admin/orders", apiFetchWithBody('GET'));

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.orders || [];
  } catch (error) {
    return [];
  }
}

// ========== SECURITY ANALYTICS API ==========

// GET /admin/security
export async function getSecurityLogs() {
  try {
    const res = await apiFetch("/admin/security", apiFetchWithBody('GET'));

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.logs || [];
  } catch (error) {
    return [];
  }
}


// DELETE /licenses/:licenseKey
export async function cancelLicense(licenseKey: string): Promise<void> {
  const res = await apiFetch(`/licenses/${licenseKey}`, apiFetchWithBody('DELETE'));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to cancel license' }));
    throw new Error(errorData.error || errorData.message || 'Failed to cancel license');
  }
}

// POST /licenses/reactivate/:licenseKey
export async function reactivateLicense(licenseKey: string): Promise<void> {
  const res = await apiFetch(`/licenses/reactivate/${licenseKey}`, apiFetchWithBody('POST'));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to reactivate license' }));
    throw new Error(errorData.error || errorData.message || 'Failed to reactivate license');
  }
}

// DELETE /licenses/delete/:licenseKey
export async function deleteLicense(licenseKey: string): Promise<void> {
  const res = await apiFetch(`/licenses/delete/${licenseKey}`, apiFetchWithBody('DELETE'));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to delete license' }));
    throw new Error(errorData.error || errorData.message || 'Failed to delete license');
  }
}

// ========== API KEYS API ==========

// GET /apikeys
export async function getApiKeys(): Promise<ApiKeyResponse[]> {
  try {
    const res = await apiFetch("/apikeys", apiFetchWithBody('GET'));
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.apiKeys || [];
  } catch (error) {
    return [];
  }
}

// POST /apikeys
export async function createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
  const res = await apiFetch("/apikeys", apiFetchWithBody('POST', data));
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create API key' }));
    throw new Error(errorData.error || errorData.message || 'Failed to create API key');
  }
  
  const responseData = await res.json();
  return responseData.apiKey || responseData;
}

// DELETE /apikeys/:api_key
export async function deleteApiKey(api_key: string): Promise<void> {
  const res = await apiFetch(`/apikeys/${api_key}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to delete API key' }));
    throw new Error(errorData.error || errorData.message || 'Failed to delete API key');
  }
}

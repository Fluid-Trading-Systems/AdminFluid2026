import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardHome } from '@/pages/DashboardHome';
import { ProductsPage } from '@/pages/ProductsPage';
import { LicensesPage } from '@/pages/LicensesPage';
import CustomersPage from '@/pages/CustomersPage';
import OrdersPage from '@/pages/OrdersPage';
import { ApiKeysPage } from '@/pages/ApiKeysPage';
import AnalyticsPage from '@/pages/AnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />            
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './router/ProtectedRoute';
import RoleRoute from './router/RoleRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Utility pages
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrdersPage from './pages/buyer/BuyerOrdersPage';
import BuyerOrderDetailPage from './pages/buyer/BuyerOrderDetailPage';
import BuyerCreateOrderPage from './pages/buyer/BuyerCreateOrderPage';
import BuyerPaymentsPage from './pages/buyer/BuyerPaymentsPage';
import PaymentSuccessPage from './pages/buyer/PaymentSuccessPage';
import PaymentCancelPage from './pages/buyer/PaymentCancelPage';
import BuyerInvoicesPage from './pages/buyer/BuyerInvoicesPage';
import InvoiceDetailPage from './pages/buyer/InvoiceDetailPage';
import BuyerShipmentsPage from './pages/buyer/BuyerShipmentsPage';
import ShipmentTrackingPage from './pages/buyer/ShipmentTrackingPage';
import BuyerDocumentsPage from './pages/buyer/BuyerDocumentsPage';
import BuyerNotificationsPage from './pages/buyer/BuyerNotificationsPage';
import BuyerProfilePage from './pages/buyer/BuyerProfilePage';

// Exporter pages
import ExporterDashboard from './pages/exporter/ExporterDashboard';
import ExporterProductsPage from './pages/exporter/ExporterProductsPage';
import ExporterProductFormPage from './pages/exporter/ExporterProductFormPage';
import ExporterOrdersPage from './pages/exporter/ExporterOrdersPage';
import ExporterOrderDetailPage from './pages/exporter/ExporterOrderDetailPage';
import ExporterCreateShipmentPage from './pages/exporter/ExporterCreateShipmentPage';
import ExporterShipmentsPage from './pages/exporter/ExporterShipmentsPage';
import ExporterDocumentsPage from './pages/exporter/ExporterDocumentsPage';
import ExporterRevenuePage from './pages/exporter/ExporterRevenuePage';
import ExporterProfilePage from './pages/exporter/ExporterProfilePage';

// Logistics pages
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import LogisticsShipmentsPage from './pages/logistics/LogisticsShipmentsPage';
import LogisticsShipmentDetailPage from './pages/logistics/LogisticsShipmentDetailPage';
import LogisticsUpdateShipmentPage from './pages/logistics/LogisticsUpdateShipmentPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminShipmentsPage from './pages/admin/AdminShipmentsPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminCustomsPage from './pages/admin/AdminCustomsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Buyer routes */}
            <Route
              path="/buyer/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['buyer']}>
                    <Routes>
                      <Route path="dashboard" element={<BuyerDashboard />} />
                      <Route path="orders" element={<BuyerOrdersPage />} />
                      <Route path="orders/create" element={<BuyerCreateOrderPage />} />
                      <Route path="orders/:orderId" element={<BuyerOrderDetailPage />} />
                      <Route path="payments" element={<BuyerPaymentsPage />} />
                      <Route path="payment/success" element={<PaymentSuccessPage />} />
                      <Route path="payment/cancel" element={<PaymentCancelPage />} />
                      <Route path="invoices" element={<BuyerInvoicesPage />} />
                      <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
                      <Route path="shipments" element={<BuyerShipmentsPage />} />
                      <Route path="shipments/:shipmentId" element={<ShipmentTrackingPage />} />
                      <Route path="documents" element={<BuyerDocumentsPage />} />
                      <Route path="notifications" element={<BuyerNotificationsPage />} />
                      <Route path="profile" element={<BuyerProfilePage />} />
                      <Route path="*" element={<Navigate to="/buyer/dashboard" replace />} />
                    </Routes>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Exporter routes */}
            <Route
              path="/exporter/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['exporter']}>
                    <Routes>
                      <Route path="dashboard" element={<ExporterDashboard />} />
                      <Route path="products" element={<ExporterProductsPage />} />
                      <Route path="products/new" element={<ExporterProductFormPage />} />
                      <Route path="products/:productId/edit" element={<ExporterProductFormPage />} />
                      <Route path="orders" element={<ExporterOrdersPage />} />
                      <Route path="orders/:orderId" element={<ExporterOrderDetailPage />} />
                      <Route path="orders/:orderId/shipment" element={<ExporterCreateShipmentPage />} />
                      <Route path="shipments" element={<ExporterShipmentsPage />} />
                      <Route path="documents" element={<ExporterDocumentsPage />} />
                      <Route path="revenue" element={<ExporterRevenuePage />} />
                      <Route path="profile" element={<ExporterProfilePage />} />
                      <Route path="*" element={<Navigate to="/exporter/dashboard" replace />} />
                    </Routes>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Logistics routes */}
            <Route
              path="/logistics/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['logistics']}>
                    <Routes>
                      <Route path="dashboard" element={<LogisticsDashboard />} />
                      <Route path="shipments" element={<LogisticsShipmentsPage />} />
                      <Route path="shipments/:shipmentId" element={<LogisticsShipmentDetailPage />} />
                      <Route path="shipments/:shipmentId/update" element={<LogisticsUpdateShipmentPage />} />
                      <Route path="*" element={<Navigate to="/logistics/dashboard" replace />} />
                    </Routes>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="companies" element={<AdminCompaniesPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="payments" element={<AdminPaymentsPage />} />
                      <Route path="shipments" element={<AdminShipmentsPage />} />
                      <Route path="documents" element={<AdminDocumentsPage />} />
                      <Route path="customs" element={<AdminCustomsPage />} />
                      <Route path="reports" element={<AdminReportsPage />} />
                      <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Utility routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

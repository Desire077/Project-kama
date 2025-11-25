import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Offers = lazy(() => import('./pages/Offers'));
const OfferDetail = lazy(() => import('./pages/OfferDetail'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SimplifiedSellerDashboard = lazy(() => import('./pages/SimplifiedSellerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProperties = lazy(() => import('./pages/AdminProperties'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminStatistics = lazy(() => import('./pages/AdminStatistics'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const CreateProperty = lazy(() => import('./pages/CreateProperty'));
const EditProperty = lazy(() => import('./pages/EditProperty'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const DocumentSubmission = lazy(() => import('./pages/DocumentSubmission'));
const BoostCheckout = lazy(() => import('./pages/BoostCheckout'));
const PremiumSubscription = lazy(() => import('./pages/PremiumSubscription'));
const PremiumSuccess = lazy(() => import('./pages/PremiumSuccess'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const BuyerGuide = lazy(() => import('./pages/BuyerGuide'));
const SellerGuide = lazy(() => import('./pages/SellerGuide'));
const Blog = lazy(() => import('./pages/Blog'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancelled = lazy(() => import('./pages/PaymentCancelled'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
const OfferRedirect = lazy(() => import('./pages/OfferRedirect'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [token, user, dispatch]);

  return (
    <Suspense fallback={<AppFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/offers/:id" element={<OfferDetail />} />
          <Route
            path="/offers/:id/edit"
            element={
              <ProtectedRoute>
                <EditProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendre"
            element={
              <ProtectedRoute>
                <CreateProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/pay"
            element={
              <ProtectedRoute>
                <BoostCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumSubscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium/success"
            element={
              <ProtectedRoute>
                <PremiumSuccess />
              </ProtectedRoute>
            }
          />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/guide-acheteur" element={<BuyerGuide />} />
          <Route path="/guide-vendeur" element={<SellerGuide />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/acheter" element={<Offers />} />
          <Route path="/louer" element={<Offers />} />
          <Route path="/vacances" element={<Offers />} />
          <Route path="/payment-status/:reference" element={<PaymentStatus />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/offers/redirect/:id" element={<OfferRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route
            path="/dashboard/seller"
            element={
              <ProtectedRoute requireRole="vendeur">
                <SimplifiedSellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/properties"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/reports"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/statistics"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminStatistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/payments"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminPayments />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-ink)] gap-4">
      <div className="h-12 w-12 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[var(--color-muted)]">Chargement de l'expérience Kama…</p>
    </div>
  );
}

export default App;
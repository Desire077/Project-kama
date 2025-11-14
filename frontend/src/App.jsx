import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import OfferRedirect from './pages/OfferRedirect';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SimplifiedSellerDashboard from './pages/SimplifiedSellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProperties from './pages/AdminProperties';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminStatistics from './pages/AdminStatistics';
import AdminPayments from './pages/AdminPayments';
import CreateProperty from './pages/CreateProperty';
import EditProperty from './pages/EditProperty';
import UserProfile from './pages/UserProfile';
import MyProfile from './pages/MyProfile';
import DocumentSubmission from './pages/DocumentSubmission';
import BoostCheckout from './pages/BoostCheckout';
import PremiumSubscription from './pages/PremiumSubscription';
import PremiumSuccess from './pages/PremiumSuccess';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import BuyerGuide from './pages/BuyerGuide';
import SellerGuide from './pages/SellerGuide';
import Blog from './pages/Blog';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentStatus from './pages/PaymentStatus';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Hide navbar and footer on login and register pages
  const hideNavAndFooter = location.pathname === '/login' || location.pathname === '/register';

  // Fetch user profile if token exists but user data is missing
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile());
    }
  }, [token, user, dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/offers/:id" element={user ? <OfferDetail /> : <OfferRedirect />} />
          <Route path="/offers/:id/edit" element={<EditProperty />} />
          <Route path="/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/seller" element={<ProtectedRoute><SimplifiedSellerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/properties" element={<ProtectedRoute><AdminProperties /></ProtectedRoute>} />
          <Route path="/dashboard/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/dashboard/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
          <Route path="/dashboard/admin/statistics" element={<ProtectedRoute><AdminStatistics /></ProtectedRoute>} />
          <Route path="/dashboard/admin/payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
          <Route path="/vendre" element={<ProtectedRoute><CreateProperty /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/documents" element={<ProtectedRoute><DocumentSubmission /></ProtectedRoute>} />
          <Route path="/seller/pay" element={<ProtectedRoute><BoostCheckout /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute><PremiumSubscription /></ProtectedRoute>} />
          <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
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
        </Routes>
      </main>
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

export default App;
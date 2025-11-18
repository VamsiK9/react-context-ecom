// client/src/App.jsx

import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx"; // FIX: Added .jsx extension
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // FIX: Added .jsx extension

// Contexts
// Assuming the context is at src/context/auth/AuthContext.jsx
import { AuthContext } from "./context/auth/AuthContext.jsx"; // FIX: Added .jsx extension

// Pages
import HomeScreen from "./pages/HomeScreen.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import RegisterScreen from "./pages/RegisterScreen.jsx";
import ProductScreen from "./pages/ProductScreen.jsx";
import CartScreen from "./pages/CartScreen.jsx";
import WishlistScreen from "./pages/WishlistScreen.jsx";
import ShippingScreen from "./pages/ShippingScreen.jsx";
import PaymentScreen from "./pages/PaymentScreen.jsx";
import PlaceOrderScreen from "./pages/PlaceOrderScreen.jsx";
import OrderScreen from "./pages/OrderScreen.jsx";
import ProfileScreen from "./pages/ProfileScreen.jsx";
import ProductCreateScreen from "./pages/ProductCreateScreen.jsx"; // <-- New import with fixed extension

function App() {
  // Get userInfo from context
  const { userInfo } = useContext(AuthContext);

  return (
    <Router>
      <Header />
      <main className="container mx-auto px-4 py-4 min-h-screen bg-white">
        <Routes>
          {/* 1. Public Routes (Accessible without login) */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />

          {/* 2. Default Route Check (Redirects non-logged-in users to Login) */}
          <Route
            path="/"
            element={
              userInfo ? (
                <HomeScreen /> // If logged in, show home screen
              ) : (
                <LoginScreen />
              ) // If NOT logged in, show login screen
            }
          />
          {/* 3. Protected Routes (Require login via ProtectedRoute wrapper) */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistScreen />
              </ProtectedRoute>
            }
          />

          {/* Checkout Flow Routes (Must be protected) */}
          <Route
            path="/shipping"
            element={
              <ProtectedRoute>
                <ShippingScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placeorder"
            element={
              <ProtectedRoute>
                <PlaceOrderScreen />
              </ProtectedRoute>
            }
          />

          {/* Order Details Route (Must be protected) */}
          <Route
            path="/order/:id"
            element={
              <ProtectedRoute>
                <OrderScreen />
              </ProtectedRoute>
            }
          />
          {/* User Profile Route (Must be protected) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            }
          />

          {/* 4. Host/Admin Routes (Protected: Should only be accessed by hosts/admins) */}
          <Route
            path="/admin/product/create" // <--- 2. NEW ADMIN ROUTE
            element={
              <ProtectedRoute>
                <ProductCreateScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;

// client/src/main.jsx (FIXED)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/auth/AuthContext.jsx'; 
import { ProductProvider } from './context/products/ProductContext.jsx';
import { CartWishlistProvider } from './context/cartWishlist/CartWishlistContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <ProductProvider> 
        <CartWishlistProvider> 
          <App />
        </CartWishlistProvider>
      </ProductProvider>
    </AuthProvider>
  </React.StrictMode>,
)
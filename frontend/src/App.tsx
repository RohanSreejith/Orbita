import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CustomerShop } from './pages/CustomerShop';
import { RetailerDashboard } from './pages/RetailerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { useStore } from './store/useStore';

function App() {
  const { fetchInitialData } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/shop" replace />} />
          <Route path="shop" element={<CustomerShop />} />
          <Route path="retailer" element={<RetailerDashboard />} />
          <Route path="retailer" element={<RetailerDashboard />} />
          <Route path="supply-chain" element={<SupplierDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

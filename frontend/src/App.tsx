import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CustomerShop } from './pages/CustomerShop';
import { RetailerDashboard } from './pages/RetailerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { useStore } from './store/useStore';
import { WelcomeScreen } from './components/WelcomeScreen';

import { LoginPage } from './pages/LoginPage';
import { RetailerLogin } from './pages/RetailerLogin';
import { SupplierLogin } from './pages/SupplierLogin';

function App() {
  const { fetchInitialData } = useStore();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <>
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login/retailer" element={<RetailerLogin />} />
          <Route path="/login/supplier" element={<SupplierLogin />} />
          <Route element={<MainLayout />}>
            <Route path="/shop" element={<CustomerShop />} />
            <Route path="/retailer" element={<RetailerDashboard />} />
            <Route path="/supply-chain" element={<SupplierDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

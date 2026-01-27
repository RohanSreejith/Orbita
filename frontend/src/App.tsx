import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CustomerShop } from './pages/CustomerShop';
import { RetailerDashboard } from './pages/RetailerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { useStore } from './store/useStore';

import { LoginPage } from './pages/LoginPage';
import { RetailerLogin } from './pages/RetailerLogin';
import { SupplierLogin } from './pages/SupplierLogin';

function App() {
  const { fetchInitialData } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
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
  );
}

export default App;

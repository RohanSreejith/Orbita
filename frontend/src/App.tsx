import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CustomerShop } from './pages/CustomerShop';
import { RetailerDashboard } from './pages/RetailerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/shop" replace />} />
          <Route path="shop" element={<CustomerShop />} />
          <Route path="retailer" element={<RetailerDashboard />} />
          <Route path="supplier" element={<SupplierDashboard />} />
          <Route path="warehouse" element={<SupplierDashboard />} /> {/* Reusing supplier for warehouse for now */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

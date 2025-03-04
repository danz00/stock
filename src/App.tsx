import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Movements from './pages/Movements';
import Equipment from './pages/Equipment';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentMovements from './pages/EquipmentMovements';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return isAdmin ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />      
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="movements" element={<Movements />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="equipment/new" element={<EquipmentForm />} />
          <Route path="equipment/:id" element={<EquipmentForm />} />
          <Route path="equipment-movements" element={<EquipmentMovements />} />
          <Route path="reports" element={<Reports />} />
          <Route 
            path="admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
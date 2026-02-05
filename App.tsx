import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Layout } from './src/components/Layout';
import { Login } from './src/pages/Login';
import { Dashboard } from './src/pages/Dashboard';
import { Costs } from './src/pages/Costs';
import { BudgetList } from './src/pages/BudgetList';
import { BudgetForm } from './src/pages/BudgetForm';
import { Reports } from './src/pages/Reports';
import { Guide } from './src/pages/Guide';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="costs" element={<Costs />} />
            <Route path="budgets" element={<BudgetList />} />
            <Route path="budgets/new" element={<BudgetForm />} />
            <Route path="budgets/edit/:id" element={<BudgetForm />} />
            <Route path="reports" element={<Reports />} />
            <Route path="guide" element={<Guide />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: 'user' | 'manager' | 'admin';
}

// Временная заглушка для аутентификации - позже заменим на Supabase Auth
const mockAuth = {
  isLoggedIn: true, // Для тестирования ставим true
  user: {
    id: '1',
    email: 'admin@example.com',
    role: 'admin' as const
  }
};

const RequireAuth = ({ children, requiredRole }: RequireAuthProps) => {
  const location = useLocation();

  if (!mockAuth.isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { user: 1, manager: 2, admin: 3 };
    const userRoleLevel = roleHierarchy[mockAuth.user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;
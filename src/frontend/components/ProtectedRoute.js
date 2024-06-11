



import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, setActiveLink, loading } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveLink('home');
    }
  }, [isAuthenticated, setActiveLink]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;





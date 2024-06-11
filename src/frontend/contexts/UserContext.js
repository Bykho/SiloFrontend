



import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import config from '../config';


const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || 'home');

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        const decodedToken = jwtDecode(data.access_token);
        setUser(decodedToken);
        setActiveLink('profile');
      } else {
        throw new Error(data.message || 'Unable to login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeLink');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const addProjectToPortfolio = (project) => {
    const updatedPortfolio = [...(user?.portfolio || []), project];
    updateUser({ portfolio: updatedPortfolio });
  };

  const updateProjectInPortfolio = (index, updatedProject) => {
    const updatedPortfolio = [...(user?.portfolio || [])];
    updatedPortfolio[index] = updatedProject;
    updateUser({ portfolio: updatedPortfolio });
  };

  const removeProjectFromPortfolio = (index) => {
    const updatedPortfolio = [...(user?.portfolio || [])];
    updatedPortfolio.splice(index, 1);
    updateUser({ portfolio: updatedPortfolio });
  };
  
  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ 
      user,
      loading, 
      login, 
      logout, 
      updateUser, 
      addProjectToPortfolio, 
      updateProjectInPortfolio, 
      removeProjectFromPortfolio, 
      activeLink, 
      setActiveLink,
      isAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  );
};






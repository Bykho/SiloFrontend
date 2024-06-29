



import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import config from '../config';


const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || 'folio');

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
    console.log('made it to login');
    try {
      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      console.log('waiting for response');
      const data = await response.json();
      console.log('got response')
      if (response.ok) {
        console.log('response was ok');
        console.log('here is the access token, ', data.access_token);
        localStorage.setItem('token', data.access_token);
        const decodedToken = jwtDecode(data.access_token);

        const token = localStorage.getItem('token');

        console.log('here is the token as it is stored in the browser, ', token);
        console.log('got to where we call to /studentProfile');
        const profileResponse = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        console.log('got to before profileResponse');
        const profileData = await profileResponse.json();
        console.log('got to after profileResponse');
        if (profileResponse.ok) {
          setUser({
            ...decodedToken,
            impactful_upvote: profileData.impactful_upvote || [],
            innovative_upvote: profileData.innovative_upvote || [],
            interesting_upvote: profileData.interesting_upvote || []
          });
          console.log("Here is what is stored in the user context: ", {
            ...decodedToken,
            impactful_upvote: profileData.impactful_upvote || [],
            innovative_upvote: profileData.innovative_upvote || [],
            interesting_upvote: profileData.interesting_upvote || []
          });
        } else {
          console.error('Failed to load user details:', profileData.message);
        }

        setActiveLink('folio');
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
      setUser,
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






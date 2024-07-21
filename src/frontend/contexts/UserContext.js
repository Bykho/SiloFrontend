


import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Fix import
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

        try {
          const profileResponse = await fetch(`${config.apiBaseUrl}/studentProfile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          });

          const profileData = await profileResponse.json();
          if (profileResponse.ok) {
            setUser({
              ...decodedToken,
              upvotes: profileData.upvotes || [],
              // Add any other fields you expect in the user profile
            });
          } else {
            console.error('Failed to load user details:', profileData.message);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  const login = async (email, password) => {
    console.log('loggin in')
    try {
      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        const decodedToken = jwtDecode(data.access_token);
        const token = localStorage.getItem('token');
        console.log('here is the token as stored in local: ', token);

        const profileResponse = await fetch(`${config.apiBaseUrl}/studentProfile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });

        const profileData = await profileResponse.json();
        console.log('here is the profileData, ', profileData);
        if (profileResponse.ok) {
          setUser({
            ...decodedToken,
            upvotes: profileData.upvotes || [],
            // Add any other fields you expect in the user profile
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
    console.log('updated user getting called')
    const updatedUser = { ...user, ...updates };
    console.log('here is updatedUser: ', updatedUser)
    setUser(updatedUser);
  };

  //useEffect(() => {
  //  console.log('User state after update:', user);
  //}, [user]);
  
  const addUpvoteToUser = (upvoteId) => {
    console.log('here is the upvoteID in addUpvotetoUser: ', upvoteId)
    if (user) {
      console.log('Initial user state:', user);
      const updatedUpvotes = [...(user.upvotes || []), upvoteId];
      console.log('here is updatedUpvotes in addUpvoteUser check: ', updatedUpvotes)
      updateUser({ upvotes: updatedUpvotes });
    }
    console.log('here is user in addUpvoteToUser: ', user)
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
      addUpvoteToUser,
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



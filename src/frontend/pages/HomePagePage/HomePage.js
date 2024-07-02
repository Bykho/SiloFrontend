


import React from 'react';
import { useUser } from '../../contexts/UserContext';
import styles from './HomePage.module.css';

import config from '../../config'


function HomePage() {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  };

  const { user, loading, isAuthenticated } = useUser();  // Destructure user and loading directly from the context
  console.log("This is the isAuthenticated truth value from HomePage.js: ", isAuthenticated)


  const injectData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/injectSampleData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your backend requires it
        },
      });

      if (response.ok) {
        alert('Sample data injected successfully!');
      } else {
        alert('Failed to inject sample data.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error injecting data.');
    }
  };

  const handleKeyGeneration = async () => {
    try {
      //currently, you need to be logged in to make an access key. Thinking thats probably the right thing to do...
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/createAccessKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ created_by: user.sub }) // Pass the user who created the key
      }); 

      if (response.ok) {
        alert('Access key generated successfully!');
      } else {
        alert('Failed to generate access key.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error injecting data.');
    }
  };


  const migrateProjects = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/migrateProjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your backend requires it
        },
      });

      if (response.ok) {
        alert('Projects migrated successfully!');
      } else {
        alert('Failed to migrate projects.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error migrating projects.');
    }
  };

  const populateLayers = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/populateLayers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your backend requires it
        },
      });

      if (response.ok) {
        alert('Layers populated successfully!');
      } else {
        alert('Failed to populate layers.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error populating layers.');
    }
  };


  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Welcome to the Homepage, {user ? user.sub : 'Guest'}</h1>
      <div style={{display: 'flex', flexDirection: 'column', width: '150px'}}>
        <button onClick={injectData} style={{ marginTop: '20px' }}>Inject Sample Data</button>
        <button onClick={handleKeyGeneration} style={{ marginTop: '20px' }}>Generate Access Key</button>
        <button onClick={migrateProjects} style={{ marginTop: '20px' }}>Migrate Projects</button>
        <button onClick={populateLayers} style={{ marginTop: '20px' }}>Populate Layers</button>
      </div>
      {loading ? (
        <p>Loading user data...</p>
      ) : user ? (
        <div>
          <h2>User Data taken from UserContext:</h2>
          {Object.keys(user).map((key) => (
            <p key={key}>{`${key}: ${typeof user[key] === 'object' ? JSON.stringify(user[key], null, 2) : user[key]}`}</p>
          ))}
        </div>
      ) : (
        <p>User data not available.</p>
      )}
      <div style={{backgroundColor: 'grey'}}>
        
        {isAuthenticated ? (
          <p> isAuthenticated is true </p>
        ) : (
          <p> isAuthenticated is false</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraphComponent from '../../pages/GraphPage/ForceGraphComponent';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';

const GraphPage = () => {
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setActiveLink } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (user && user._id) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.apiBaseUrl}/returnUserProjects`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user._id }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user projects');
          }

          const projects = await response.json();
          setUserProjects(projects);
        } catch (error) {
          console.error('Error fetching user projects:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProjects();
  }, [user]);

  const handleNavigateToProfile = () => {
    setActiveLink('folio');
    navigate('/studentProfile');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="graph-page" style={{ position: 'relative', width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      {userProjects && userProjects.length > 0 ? (
        <ForceGraphComponent />
      ) : (
        <div style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <button 
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: 'linear-gradient(to bottom, #1f1f1f, #131313)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 2,
              position: 'relative',
              transform: 'translateY(-100px)'
            }}
            onClick={handleNavigateToProfile}
          >
            Make A Project To View Network Graph
          </button>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}>
            <spline-viewer url="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode" background="rgba(0,0,0,0.3)" style={{ width: '100%', height: '100%' }}></spline-viewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraphComponent from '../../pages/GraphPage/ForceGraphComponent';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';
import styles from './graphPage.module.css';

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
    <div className={styles.graphPage}>
      {userProjects && userProjects.length > 0 ? (
        <ForceGraphComponent />
      ) : (
        <div className={styles.noProjectsContainer}>
          <button 
            className={styles.navigateButton}
            onClick={handleNavigateToProfile}
          >
            Make A Project To View Network Graph
          </button>
          <div className={styles.splineViewerWrapper}>
            <spline-viewer 
              url="https://prod.spline.design/2R4lYlPvgoU3Dyzv/scene.splinecode"
              background="rgba(0,0,0,0.3)"
              className={styles.splineViewer}
            ></spline-viewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphPage;

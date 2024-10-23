// LinkedInCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './linkedInCallback.module.css';
import config from '../../config';

const LinkedInCallback = ({ onComplete }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state === sessionStorage.getItem('linkedInState')) {
        try {
          console.log('This is the code going to trialLinkedIn', code);
          const response = await fetch(`${config.apiBaseUrl}/trialLinkedIn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirect_uri: 'http://localhost:3000/linkedin-callback' })
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Authentication failed');

          setUserData(data);
          onComplete && onComplete(data);
        } catch (err) {
          setError(err.message);
        }
      } else {
        setError('Invalid authentication response');
      }

      sessionStorage.removeItem('linkedInState');
    };

    handleOAuthCallback();
  }, [navigate, onComplete]);

  const renderSection = (title, content) => {
    if (!content) return null;
    return (
      <div className={styles.section}>
        <h3>{title}</h3>
        {content}
      </div>
    );
  };

  const renderExperience = (exp) => {
    if (!exp) return null;
    return (
      <div className={styles.experience}>
        {exp.company && <p>Company: {exp.company}</p>}
        {exp.title && <p>Title: {exp.title}</p>}
        <p>Duration: {exp.starts_at || 'N/A'} - {exp.ends_at || 'Present'}</p>
        {exp.description && <p>Description: {exp.description}</p>}
      </div>
    );
  };

  const renderEducation = (edu) => {
    if (!edu) return null;
    return (
      <div className={styles.education}>
        {edu.school && <p>School: {edu.school}</p>}
        {edu.degree_name && <p>Degree: {edu.degree_name}</p>}
        {edu.field_of_study && <p>Field: {edu.field_of_study}</p>}
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => navigate('/signup')}>Go Back to Sign Up</button>
      </div>
    );
  }

  if (userData) {
    const detailedProfile = userData.detailed_profile || {};
    
    return (
      <div className={styles.success} style={{ color: 'white' }}>
        <h2>LinkedIn Authentication Successful</h2>
        
        {/* Basic Profile Information */}
        {renderSection('Basic Information', (
          <>
            {userData.name && <p>Name: {userData.name}</p>}
            {userData.email && <p>Email: {userData.email}</p>}
          </>
        ))}

        {/* Current Company */}
        {detailedProfile.current_company && renderSection('Current Position', (
          <>
            {detailedProfile.current_company.name && 
              <p>Company: {detailedProfile.current_company.name}</p>}
            {detailedProfile.current_company.title && 
              <p>Title: {detailedProfile.current_company.title}</p>}
          </>
        ))}

        {/* Work Experience */}
        {detailedProfile.experiences?.length > 0 && renderSection('Work Experience',
          detailedProfile.experiences.map((exp, index) => (
            <div key={index}>{renderExperience(exp)}</div>
          ))
        )}

        {/* Education */}
        {detailedProfile.education?.length > 0 && renderSection('Education',
          detailedProfile.education.map((edu, index) => (
            <div key={index}>{renderEducation(edu)}</div>
          ))
        )}

        {/* Skills */}
        {detailedProfile.skills?.length > 0 && renderSection('Skills',
          <div className={styles.skills}>
            {detailedProfile.skills.map((skill, index) => (
              skill && <span key={index} className={styles.skill}>{skill}</span>
            ))}
          </div>
        )}

        {/* Certifications */}
        {detailedProfile.certifications?.length > 0 && renderSection('Certifications',
          detailedProfile.certifications.map((cert, index) => (
            cert && (
              <div key={index} className={styles.certification}>
                {cert.name && <p>{cert.name}</p>}
                {cert.issuer && <p>Issuer: {cert.issuer}</p>}
              </div>
            )
          ))
        )}
      </div>
    );
  }

  return <div className={styles.loading}>Processing LinkedIn authentication...</div>;
};

export default LinkedInCallback;


import React from 'react';
import { Link } from 'react-router-dom';

const FacultyResearchNavButton = () => {
  const portalStyle = {
    backgroundColor: '#B9D9EB',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '10px',
    marginTop: '20px',
    cursor: 'pointer', // Add cursor pointer to indicate clickable
  };

  return (
    <Link to="/facultyResearch" style={{ textDecoration: 'none' }}>
      <div style={portalStyle}>
        <h2>Faculty Research Nav Button</h2>
      </div>
    </Link>
  );
};

export default FacultyResearchNavButton;

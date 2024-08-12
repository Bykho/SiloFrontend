


import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import styles from './newDiscussionBoard.module.css';
import config from '../../config'; // Ensure this path is correct for your project
import { useUser } from '../../contexts/UserContext';
import SmallestProjectEntry from '../../components/ProjectEntryPage/SmallestProjectEntry';

// Utility function to convert ObjectId to string within a JSON object
const convertObjectIdToString = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    if (obj instanceof Array) {
      return obj.map(item => convertObjectIdToString(item));
    } else {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = (typeof value === 'object' && value !== null && value.constructor.name === 'ObjectID')
          ? value.toString()
          : convertObjectIdToString(value);
        return acc;
      }, {});
    }
  }
  return obj;
};

const BountiesBoard = ({ group }) => {
  const [bountiesJson, setBountiesJson] = useState(group.bounties ? convertObjectIdToString(group.bounties) : {});
  const [newBounty, setNewBounty] = useState({ text: '', title: '' });
  const [bounties, setBounties] = useState([]);
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState({});
  const [projectLoading, setProjectLoading] = useState(false);


  useEffect(() => {
    console.log('Group parameter in Bounty Board:', group);
  }, [group]);
  useEffect(() => {
    console.log('bountiesJson in bounties board: ', bountiesJson)
  }, [bountiesJson]);
  useEffect(() => {
    console.log('bounties in bountyboard: ', bounties)
  }, [bounties])


  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/returnUserProjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),  // Assuming `user._id` is accessible
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('return user projects: ', data)
        setProjects(data);  // Set the array of projects
      } else {
        console.error('Failed to fetch projects');
      }
    };
  
    fetchProjects();
  }, [user._id]);
  

  useEffect(() => {
    const fetchBounties = async () => {
      console.log('BOUNTYBOARD made it into fetch bounties')
      const allBountyIds = group.bounties || [];
      if (allBountyIds.length === 0) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/getBountiesByIds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bounties: allBountyIds }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('BOUNTYBOARD data from /getBountiesByIds', data)
        setBounties(data);
      } else {
        console.error('Failed to fetch bounties');
      }
      setLoading(false);
    };
    fetchBounties();
  }, [group.bounties]);

  // Fetch project details for the selected bounty
  const fetchProjectDetails = async (projectIds) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectIds }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched project details:', data);
        return data;
      } else {
        console.error('Failed to fetch project details');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
    return [];
  };

  const handleAddBounty = async () => {
    if (newBounty.text.trim() !== '' && newBounty.title.trim() !== '') {
      const token = localStorage.getItem('token');

      // Set projectName and projectId based on selectedProject, or use empty strings
      const [projectName, projectId] = selectedProject !== ''
        ? selectedProject.split(',')
        : ['', ''];


      const bountyData = { 
        text: newBounty.text, 
        groupId: group._id, 
        title: newBounty.title,
        project_links: [{"projectName": projectName, "project_id": projectId}] 
      };

      try {
        const response = await fetch(`${config.apiBaseUrl}/handleGroupBountyPost`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bountyData),
        });
        const data = await response.json();
        if (response.ok) {
            setBounties(prevBounties => [...prevBounties, data.newBounty]);
            setNewBounty({ text: '', title: '' });
            setSelectedProject('');
        } else {
          console.error('Failed to add bounties:', data.error);
        }
      } catch (error) {
        console.error('Error during adding bounties:', error);
      }
    }
  };


  const handleViewProject = async (bounty) => {
    setProjectLoading(true);  // Start loading
    setIsModalOpen(true);      // Open modal immediately
  
    const projectIds = bounty.project_links.map(link => link.project_id);
    const projects = await fetchProjectDetails(projectIds);
  
    setProjectDetails(prevDetails => ({ ...prevDetails, [bounty._id]: projects }));
    setSelectedBounty(bounty);
    setProjectLoading(false);  // Stop loading
  };
  
  


  if (loading) {
    return <div>Loading Bounties...</div>;
  }

  return (
    <div className={styles.discussionBoardContainer}>
      {bounties.length > 0 ? (
        <div className={styles.commentJsonContainer}>
          {bounties.map((bounty, index) => (
            <div key={index} className={styles.commentSection}>
              <h3 className={styles.commentTitle}>Bounty</h3>
              <div className={styles.commentList}>
                <div className={styles.commentCard}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{bounty.author}</span>
                  </div>
                  <div className={styles.commentRow}>
                    <p className={styles.commentText}>{bounty.text}</p>
                    {/* Check if project_links is non-empty and display project info */}
                    {bounty.project_links && bounty.project_links.length > 0 && (
                      <div className={styles.projectInfo}>
                        <p>Project Name: {bounty.project_links[0].projectName}</p>
                        <p>Project ID: {bounty.project_links[0].project_id}</p>
                      </div> 
                    )}
                    <button onClick={() => { setSelectedBounty(bounty); setIsModalOpen(true); handleViewProject(bounty)}}>
                      View Project Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noComments}>No bounties available</p>
      )}
      
      {isModalOpen && selectedBounty && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
            <button className={styles.closeModalButton} onClick={() => setIsModalOpen(false)}>x</button>
            <h3>Project Details</h3>
            {projectLoading ? (
                <p>Loading project details...</p>  // Show loading message while fetching data
            ) : projectDetails[selectedBounty._id] && projectDetails[selectedBounty._id].length > 0 ? (
                <div>
                {projectDetails[selectedBounty._id].map(project => (
                    <SmallestProjectEntry key={project._id} project={project} />
                ))}
                </div>
            ) : (
                <p>No project linked to this bounty.</p>
            )}
            </div>
        </div>
        )}



      {/* Always display the input field for adding a new bounty */}
      <div className={styles.commentInputContainer}>
        <input
          type="text"
          placeholder="Bounty Title..."
          className={styles.commentInput}
          value={newBounty.title}
          onChange={(e) => setNewBounty(prevState => ({ ...prevState, title: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Post a bounty..."
          className={styles.commentInput}
          value={newBounty.text}
          onChange={(e) => setNewBounty(prevState => ({ ...prevState, text: e.target.value }))}
        />
        <select
          className={styles.projectSelect}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project._id} value={`${project.projectName},${project._id}`}>
              {project.projectName}
            </option>
          ))}
        </select>
        <button
          className={styles.addCommentButton}
          onClick={() => handleAddBounty()}
        >
          Submit Bounty
        </button>
      </div>
    </div>
  );
  
};


export default BountiesBoard;

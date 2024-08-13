


import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import styles from './newDiscussionBoard.module.css';
import config from '../../config'; // Ensure this path is correct for your project
import { useUser } from '../../contexts/UserContext';
import SmallProjectEntry from '../../components/ProjectEntryPage/SmallProjectEntry';

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
  const [responseVisibility, setResponseVisibility] = useState({});
  const [bountyResponses, setBountyResponses] = useState({});
  const [newResponse, setNewResponse] = useState({});
  const [openProjectId, setOpenProjectId] = useState(null);

  


  useEffect(() => {
    console.log('Group parameter in Bounty Board:', group);
  }, [group]);
  useEffect(() => {
    console.log('bountyResponses in bounties board: ', bountyResponses)
  }, [bountyResponses]);
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

  const handleToggleResponses = async (bountyId) => {
    console.log('handleToggleResponse bountyID: ', bountyId)
    setResponseVisibility(prevVisibility => ({
      ...prevVisibility,
      [bountyId]: !prevVisibility[bountyId],
    }));
  
    // If the responses are already fetched, just toggle visibility
    if (bountyResponses[bountyId]) return;
  
    // Fetch the responses from the backend
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiBaseUrl}/getBountyResponses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bountyId }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('HANDLETOGGLERESPONSES getBountyResponses data: ', data)
        setBountyResponses(prevResponses => ({
          ...prevResponses,
          [bountyId]: data,
        }));
      } else {
        console.error('Failed to fetch responses');
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };
  

  const handleViewProject = async (bounty) => {
    if (openProjectId === bounty._id) {
      // If the project is already open, close it
      setOpenProjectId(null);
      setIsModalOpen(false);
      setSelectedBounty(null);
    } else {
      // If the project is closed, open it
      setProjectLoading(true);
      setIsModalOpen(true);
      setSelectedBounty(bounty);
      setOpenProjectId(bounty._id);
  
      const projectIds = bounty.project_links.map(link => link.project_id);
      const projects = await fetchProjectDetails(projectIds);
  
      setProjectDetails(prevDetails => ({ ...prevDetails, [bounty._id]: projects }));
      setProjectLoading(false);
    }
  };
  
  const handleResponseInputChange = (bountyId, value) => {
    setNewResponse(prevState => ({
      ...prevState,
      [bountyId]: value,
    }));
  };
  
  const handleAddResponse = async (bountyId) => {
    if (!newResponse[bountyId]?.trim()) return;
  
    const token = localStorage.getItem('token');
    const responsePayload = {
      bountyId: bountyId,
      author_name: user.username,
      author_id: user._id,
      text: newResponse[bountyId],
      date: new Date().toISOString(),
    };
    
    console.log('HANDLEADDRESPONSE here is responsePayload: ', responsePayload)

    try {
      const response = await fetch(`${config.apiBaseUrl}/addBountyResponse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsePayload),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('HANDLEADDRESPONSE here is the daata from the backend: ', data)
        console.log('HANDLEADDRESPONSE here is the daata from the backend: ', data.new_response)
        setBountyResponses(prevResponses => ({
          ...prevResponses,
          [bountyId]: [...(prevResponses[bountyId] || []), data.new_response],
        }));
        console.log('checking if we get passed setting the local state')
        setNewResponse(prevState => ({
          ...prevState,
          [bountyId]: '',
        }));
        console.log('checking if we get passed setting the new response')
      } else {
        console.error('Failed to add response');
      }
    } catch (error) {
      console.error('Error adding response:', error);
    }
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
                        <button 
                          onClick={() => handleViewProject(bounty)} 
                          className={styles.openProjectButton}
                        >
                          {openProjectId === bounty._id ? "Close Project" : "View Project: " + bounty.project_links[0].projectName}
                        </button>
                    </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleToggleResponses(bounty._id)}
                    className={styles.toggleResponsesButton}
                    >
                    {responseVisibility[bounty._id] ? "Close Bounty" : "Open Bounty"}
                  </button>
                  {responseVisibility[bounty._id] && (
                  <div className={styles.responsesContainer}>
                    {bountyResponses[bounty._id] && bountyResponses[bounty._id].length > 0 ? (
                    bountyResponses[bounty._id].map((response, index) => (
                        response && (
                        <>
                            {console.log('here is response', response)}
                            <div key={index} className={styles.responseItem}>
                            <p><strong className={styles.responseAuthor}>{response.author_name}</strong> ({new Date(response.date).toLocaleDateString()}):</p>
                            <p>{response.text}</p>
                            </div>
                        </>
                        )
                    ))
                    ) : (
                    <p>No responses yet...</p>
                    )}
                      {/* Input bar for adding a new response */}
                      <div className={styles.responseInputContainer}>
                      <input
                          type="text"
                          placeholder="Type your response..."
                          value={newResponse[bounty._id] || ''}
                          onChange={(e) => handleResponseInputChange(bounty._id, e.target.value)}
                          className={styles.responseInput}
                      />
                      <button onClick={() => handleAddResponse(bounty._id)} className={styles.submitButton}>Submit Response</button>
                      </div>
                  </div>
                  )}

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
            {projectLoading ? (
              <p>Loading project details...</p>
            ) : projectDetails[selectedBounty._id] && projectDetails[selectedBounty._id].length > 0 ? (
              <div>
                {projectDetails[selectedBounty._id].map(project => (
                  <SmallProjectEntry key={project._id} project={project} />
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
          placeholder="What do you want done?..."
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

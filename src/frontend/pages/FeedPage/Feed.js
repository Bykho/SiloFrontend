import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Tagged from '../../components/TagsFeed';
import CombinedFeedSidebar from './NewFeedSidebar';
import styles from './feed.module.css';
import config from '../../config';
import NewAddProjectToGroup from './NewAddProjectToGroup';
import NewGroupMembers from './NewGroupMembers';
import NewDiscussionBoard from './NewDiscussionBoard';
import BountyBoard from './BountyBoard';
import { FaSearch } from 'react-icons/fa';
import { MdOutlinePostAdd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaRegListAlt } from "react-icons/fa";
import { GoCommentDiscussion } from "react-icons/go";
import { FaCrown } from "react-icons/fa";
import LoadingIndicator from '../../components/LoadingIndicator';
import {CircularProgress}from '@mui/material';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


const Feed = () => {
  const [feedStyle, setFeedStyle] = useState('home');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('');
  const [userUpvotes, setUserUpvotes] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membersShow, setMembersShow] = useState(false);
  const [projectShow, setProjectShow] = useState(true);
  const [discussionShow, setDiscussionShow] = useState(false);
  const [bountyShow, setBountyShow] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const [upvotedProjects, setUpvotedProjectIds] = useState([]);


  // Highlight: New state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let endpoint = '/returnFeed';  // Default to home feed
      let body = { page, per_page: perPage };
  
      if (feedStyle === 'popular') {
        endpoint = '/popularFeed';
      } else if (feedStyle === 'upvoted') {
        endpoint = '/returnProjects';
        body = userUpvotes; // Send the array of upvote IDs instead of pagination data
      }
  
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data.projects || data); // Handle both paginated and non-paginated responses
      if (data.total_pages) {
        setTotalPages(data.total_pages);
        setCurrentPage(data.page);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feedStyle === 'home' || feedStyle === 'popular' || feedStyle === 'upvoted') {
      fetchProjects(currentPage);  // Fetch projects when the feed style is 'home', 'popular', or 'upvoted'
    }
  
    const fetchUpvotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }
      try {
        const response = await fetch(`${config.apiBaseUrl}/getUserUpvotes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user._id })
        });
        const data = await response.json();
        if (response.ok) {
          setUserUpvotes(data.upvotes);
        } else {
          console.error('Failed to fetch upvotes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching upvotes:', error);
      }
    };
    
    if (user) {
      fetchUpvotes();
    }
  }, [user, currentPage, perPage, feedStyle]);  // Add feedStyle as a dependency
  

  useEffect(() => {
    const fetchUpvotedProjects = async () => {
      if (user && user.upvotes && user.upvotes.length > 0) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${config.apiBaseUrl}/returnProjects`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user.upvotes),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch upvoted projects');
          }
          const data = await response.json();
          console.log("list of projects?: ", data); 
          setUpvotedProjectIds(data);
        } catch (error) {
          console.error('Error fetching upvoted projects:', error);
        }
      }
    };

    fetchUpvotedProjects();
  }, [user]);

  useEffect(() => {
    setFilteredProjects([]);  // Clear filteredProjects whenever feedStyle changes
    setCurrentPage(1);  // Reset to first page when changing feed style
  
    if (feedStyle === 'groupView' && activeGroup) {
      fetchGroupProjects();
    } else if (feedStyle === 'home' || feedStyle === 'popular' || feedStyle === 'upvoted') {
      fetchProjects(1);  // Fetch projects for the new feed style, resetting to page 1
    }
  }, [feedStyle, activeGroup]);
  
    
  const fetchGroupProjects = async () => {
    setLoading(true);
    setError('');
    if (activeGroup) {
      const group_project_ids = activeGroup.projects;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ projectIds: group_project_ids })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const returnedProjects = await response.json();
        setFilteredProjects(returnedProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    }
  };


  useEffect(() => {
    if (location.state && location.state.tag) {
      const tag = location.state.tag;
      setSearchText(tag);
      setInputText(tag);
      setFeedStyle('home');
      searchInputRef.current.focus();
      setTimeout(() => {
        handleSearch();
        navigate('/feed', { replace: true });
      }, 0);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let filtered = projects;
    console.log('filtrered test: ', filtered); 
  
    if (feedStyle === 'home' || feedStyle === 'popular' || feedStyle === 'upvoted') {
      filtered = projects.filter(project => {
        const searchTextLower = searchText.toLowerCase();
        if (project.projectDescription.toLowerCase().includes(searchTextLower)) {
          return true;
        }
        for (let layer of project.layers) {
          for (let cell of layer) {
            if (cell.type === 'text' && cell.value.toLowerCase().includes(searchTextLower)) {
              return true;
            }
          }
        }
        if (project.projectName.toLowerCase().includes(searchTextLower)) {
          return true;
        }
        if (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTextLower))) {
          return true;
        }
        return false;
      });
    }
  
    if (feedStyle === 'popular') {
      const now = new Date();
      filtered = filtered.map(project => {
        const createdAt = new Date(project.created_at);
        const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
        //const score = (project.upvotes ? project.upvotes.length : 0) / hoursElapsed;
        const score = (project.upvotes ? project.upvotes.length : 0)
        return { ...project, score };
      }).sort((a, b) => b.score - a.score);
    }

    if (feedStyle === 'upvoted') {
      filtered = upvotedProjects;
    }

    if (!activeGroup || feedStyle !== 'groupView') {
      setFilteredProjects(filtered);
    }


  }, [projects, searchText, feedStyle, activeGroup]);


  //useEffect(() => {
  //  console.log('FEED.js, here is filtered: ', filteredProjects)
  //}, [filteredProjects])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProjects(newPage);  // Fetch projects for the new page
  };

  const handleSearch = () => {
    setSearchText(inputText);
    setCurrentPage(1);  // Reset to first page when searching
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setSearchText(e.target.value);
  };

  const getHeaderText = () => {
    if (feedStyle === 'groupView' && activeGroup) {
      return activeGroup.name;
    }

    if (feedStyle === 'upvoted') {
      return 'Upvoted Projects';
    }

      return feedStyle.charAt(0).toUpperCase() + feedStyle.slice(1);
  };

  const updateGroupProjects = (newProjects) => {
    setActiveGroup((prevGroup) => ({
      ...prevGroup,
      projects: [...prevGroup.projects, ...newProjects],
    }));
  };
  
  return (
    <div className={styles.parentContainer}>
    <div className={styles.headerBox}>
        <h2>{getHeaderText()}</h2>
        {feedStyle === 'groupView' && activeGroup && (
          
          <div className={styles.headerButtons}>
            <button 
                onClick={() => setIsModalOpen(true)}
                className={`${styles.headerButton} ${styles.primary}`}
              >
                <MdOutlinePostAdd /> Add Project To Group
            </button>
            <button 
              onClick={() => {setProjectShow(true); setMembersShow(false); setDiscussionShow(false); setBountyShow(false)}}
              className={`${styles.headerButton} ${projectShow ? styles.active : ''}`}
            >
              <FaRegListAlt /> Posts
            </button>
            <button 
              onClick={() => {setMembersShow(true); setProjectShow(false); setDiscussionShow(false); setBountyShow(false)}}
              className={`${styles.headerButton} ${membersShow ? styles.active : ''}`}
            >
              <FaUsers /> Members
            </button>
            <button 
              onClick={() => {setDiscussionShow(true); setMembersShow(false); setProjectShow(false); setBountyShow(false)}}
              className={`${styles.headerButton} ${discussionShow ? styles.active : ''}`}
            >
              <GoCommentDiscussion /> Discussion
            </button>
            <button 
              onClick={() => {setBountyShow(true); setMembersShow(false); setProjectShow(false); setDiscussionShow(false)}}
              className={`${styles.headerButton} ${bountyShow ? styles.active : ''}`}
            >
              <FaCrown /> Bounties
            </button>
          </div>
        )}
      </div>
      <div className={styles.feedContainer}>
        <div className={styles.feedSidebar}>
          <CombinedFeedSidebar
            feedStyle={feedStyle}
            setFeedStyle={(newStyle) => {
              setFeedStyle(newStyle);
              setCurrentPage(1);  // Reset to first page when changing feed style
            }}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
          />
        </div>
        <div className={styles.feedMainContent}>
          <div className={styles.searchBar}>
            <div className={styles.searchWords}>
              <FaSearch />
            </div>
            <div className={styles.buttonContainer}>
              <input
                ref={searchInputRef}
                type="search"
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search projects..."
                className={styles.searchInput}
              />
            </div>
            <div className={styles.resultsCount}>
              Results: {filteredProjects.length}
            </div>
          </div>
          <div className={styles.feedContent}>
            {feedStyle === 'home' || feedStyle === 'popular' || feedStyle === 'upvoted' ? (
            loading ? (
              <div className={styles.loadingContainer}>
                <CircularProgress size={100} thickness={4} />
              </div>
            ) : (
              <>
                <Tagged
                  filteredProjects={filteredProjects}
                  loading={loading}
                  error={error}
                  userUpvotes={userUpvotes}
                  setUserUpvotes={setUserUpvotes}
                />
                {/* Highlight: New pagination controls */}
                <div className={styles.paginationControls}>
                  <button 
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                  >
                    <FaChevronLeft />
                  </button>
                  <span>{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </>
            )
            ) : feedStyle === 'groupView' && membersShow ? (
              <NewGroupMembers group={activeGroup} />
            ) : feedStyle === 'groupView' && projectShow ? (
              loading ? (
                <div className={styles.loadingContainer}>
                    <CircularProgress size={100} thickness={4} />
                </div>
              ) : (
                <Tagged
                  filteredProjects={filteredProjects}
                  loading={loading}
                  error={error}
                  userUpvotes={userUpvotes}
                  setUserUpvotes={setUserUpvotes}
                />
              )
            ) : feedStyle === 'groupView' && discussionShow ? (
              <NewDiscussionBoard group={activeGroup} />
            ) : feedStyle === 'groupView' && bountyShow ? (
              <BountyBoard group={activeGroup} />
            ) : null}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <NewAddProjectToGroup 
              group={activeGroup} 
              onClose={() => setIsModalOpen(false)} 
              updateGroupProjects={updateGroupProjects} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
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
import { CircularProgress } from '@mui/material';
import { FaChevronLeft, FaChevronRight, FaPlusCircle } from 'react-icons/fa';


const Feed = () => {
  const [feedStyle, setFeedStyle] = useState('popular');
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
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const clearProjects = () => {
    setProjects([]);
    setFilteredProjects([]);
  };

  const fetchProjects = async (page = 1) => {
    console.log('opened fetch projects')
    clearProjects();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    let endpoint = '/popularFeed'; // Default to home feed
    let body = { page, per_page: perPage };
    let method = 'POST';
    let headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    
    switch (feedStyle) {
      case 'popular':
        endpoint = '/popularFeed';
        break;
      case 'upvoted':
        endpoint = '/returnProjects';
        body = userUpvotes;
        break;
      case 'suggested':
        console.log('opened the suggested fetch feed')
        endpoint = '/getPersonalizedFeed';
        method = 'GET';
        body = null;
        // Keep existing headers, just remove Content-Type since GET does not need it
        headers = { 'Authorization': `Bearer ${token}` };
        break;
      default:
        break;
    }
    
    try {
      const options = {
        method,
        headers,
        ...(method === 'POST' && { body: JSON.stringify(body) })
      };
      
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, options);
  
      if (!response.ok) throw new Error('Failed to fetch projects');
  
      const data = await response.json();
      setProjects(data.projects || data);
      if (feedStyle !== 'suggested') {
        setTotalPages(data.total_pages || 1);
        setCurrentPage(data.page || page);
      }
      setLoading(false);  
    } catch (err) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

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
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIds: group_project_ids }),
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

    const fetchAllData = async () => {
      if (!user) {
        console.log('User is null, skipping fetch');
        return;
      }

      await fetchUpvotes();

      if (feedStyle === 'groupView' && activeGroup) {
        await fetchGroupProjects();
      } else {
        await fetchProjects(currentPage);
      }
    };

    fetchAllData();
  }, [user, currentPage, feedStyle, activeGroup]);

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
    console.log('filtered test: ', filtered); 
  
    if (feedStyle === 'popular') {
      filtered = filtered.map(project => {
        const score = (project.upvotes ? project.upvotes.length : 0);
        return { ...project, score };
      }).sort((a, b) => b.score - a.score);
    }
    
    if (!activeGroup || feedStyle !== 'groupView') {
      setFilteredProjects(filtered);
    }
  
  }, [projects, feedStyle, activeGroup]);

  const handlePageChange = (newPage) => {
    clearProjects();
    setCurrentPage(newPage);
    fetchProjects(newPage);  // Fetch projects for the new page
  };

  const handleSearch = async () => {
    if (!inputText.trim()) {
      // If it's empty, don't perform the search
      return;
    }
    setSearchText(inputText);
    setLoading(true);
    setCurrentPage(1);  // Reset to the first page when searching
    setIsSearching(true);
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/searchProjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: inputText })
      });
  
      if (!response.ok) throw new Error('Failed to perform search');
      
      const data = await response.json();
      setFilteredProjects(data.projects || []);
      setLoading(false);
  
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Failed to perform search');
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsSearching(false);
  }, [feedStyle]);  
  

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
    if (feedStyle === 'suggested') {
      return 'Projects You Might Like';
    }
    return feedStyle.charAt(0).toUpperCase() + feedStyle.slice(1);
  };

  const updateGroupProjects = (newProjects) => {
    setActiveGroup((prevGroup) => ({
      ...prevGroup,
      projects: [...new Set([...prevGroup.projects, ...newProjects])],
    }));
    fetchGroupProjects();
  };

  const removeProjectFromGroup = (projectId) => {
    setActiveGroup((prevGroup) => ({
      ...prevGroup,
      projects: prevGroup.projects.filter(id => id !== projectId),
    }));
    setFilteredProjects(prevProjects => 
      prevProjects.filter(project => project._id !== projectId)
    );
  };

  const renderSearchBar = (styleSwitch = false) => (
    <div className={styleSwitch ? styles.searchBarAlternate : styles.searchBar}>
      <div className={styles.searchWords}>
        <FaSearch />
      </div>
      <div className={styles.searchInputWrapper}>
        <input
          ref={searchInputRef}
          type="search"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search projects..."
          className={styles.searchInput}
        />
      {/*
        <button 
          className={styles.searchButton} 
          onClick={handleSearch}
        >
          Search
        </button>
        */}
      </div>
      {/*
      <div className={styles.resultsCount}>
        Results: {filteredProjects.length}
      </div>
      */}
    </div>
  );

  return (
    <div className={styles.parentContainer}>
      <div className={styles.headerBox}>
        {(feedStyle === 'groupView' && activeGroup) ? (
          <>
            <h2>{getHeaderText()}</h2>
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
          </>
        ) : (
          <div className={styles.fullWidthSearch}>
            {renderSearchBar(true)}
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
              {feedStyle === 'groupView' && activeGroup && (
                <>
                  {renderSearchBar()}
                  <div className={styles.divider}></div>
                </>
              )}
                <div className={styles.feedContent}>
            {feedStyle === 'home' || feedStyle === 'popular' || feedStyle === 'upvoted' || feedStyle === 'suggested' ? (
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
                  {!isSearching && !loading && feedStyle !== 'suggested' && (
                    <div className={styles.paginationControls}>
                      <button 
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        <FaChevronLeft />
                      </button>
                      <span className={styles.pageNum}>{currentPage} / {totalPages}</span>
                      <button 
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )
            ) : feedStyle === 'groupView' && membersShow ? (
              <NewGroupMembers group={activeGroup} />
            ) : feedStyle === 'groupView' && projectShow ? (
              loading ? (
                <div className={styles.loadingContainer}>
                    <CircularProgress size={100} thickness={4} />
                </div>
              ) : filteredProjects.length === 0 ? (
              <div className={styles.emptyState}>
                <MdOutlinePostAdd size={100} />
                <p>No projects have been added to this group yet.</p>
                <button className={styles.emptyButton} onClick={() => setIsModalOpen(true)}> <FaPlusCircle/> Add Project to Group!</button>
              </div> 
            
              ): (
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
              removeProjectFromGroup={removeProjectFromGroup}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;

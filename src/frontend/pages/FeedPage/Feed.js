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
import { FaSearch } from 'react-icons/fa';
import { MdOutlinePostAdd } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaRegListAlt } from "react-icons/fa";
import { GoCommentDiscussion } from "react-icons/go";


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
  const { user } = useUser();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/returnFeed`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const returnedProjects = await response.json();
        setProjects(returnedProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

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

    fetchProjects();
    if (user) {
      fetchUpvotes();
    }
  }, [user]);


  useEffect(() => {
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
    fetchGroupProjects();
  }, [activeGroup]);


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
  
    if (feedStyle === 'home' || feedStyle === 'popular') {
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
        const score = (project.upvotes ? project.upvotes.length : 0) / hoursElapsed;
        return { ...project, score };
      }).sort((a, b) => b.score - a.score);
    }
  
    if (!activeGroup || feedStyle !== 'groupView') {
      setFilteredProjects(filtered);
    }
  }, [projects, searchText, feedStyle, activeGroup]);


  //useEffect(() => {
  //  console.log('FEED.js, here is filtered: ', filteredProjects)
  //}, [filteredProjects])

  
  const handleSearch = () => {
    setSearchText(inputText);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setSearchText(e.target.value);
  };

  const getHeaderText = () => {
    if (feedStyle === 'groupView' && activeGroup) {
      return activeGroup.name;
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
              onClick={() => {setProjectShow(true); setMembersShow(false); setDiscussionShow(false)}}
              className={`${styles.headerButton} ${projectShow ? styles.active : ''}`}
            >
              <FaRegListAlt /> Posts
            </button>
            <button 
              onClick={() => {setMembersShow(true); setProjectShow(false); setDiscussionShow(false)}}
              className={`${styles.headerButton} ${membersShow ? styles.active : ''}`}
            >
              <FaUsers /> Members
            </button>
            <button 
              onClick={() => {setDiscussionShow(true); setMembersShow(false); setProjectShow(false)}}
              className={`${styles.headerButton} ${discussionShow ? styles.active : ''}`}
            >
              <GoCommentDiscussion /> Bounties
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`${styles.headerButton} ${styles.primary}`}
            >
              <MdOutlinePostAdd /> Post To Group
            </button>
          </div>
        )}
      </div>
      <div className={styles.feedContainer}>
        <div className={styles.feedSidebar}>
          <CombinedFeedSidebar
            feedStyle={feedStyle}
            setFeedStyle={setFeedStyle}
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
            {feedStyle === 'home' || feedStyle === 'popular' ? (
              <Tagged
                filteredProjects={filteredProjects}
                loading={loading}
                error={error}
                userUpvotes={userUpvotes}
                setUserUpvotes={setUserUpvotes}
              />
            ) : feedStyle === 'groupView' && membersShow ? (
              <NewGroupMembers group={activeGroup} />
            ) : feedStyle === 'groupView' && projectShow ? (
              <Tagged
                filteredProjects={filteredProjects}
                loading={loading}
                error={error}
                userUpvotes={userUpvotes}
                setUserUpvotes={setUserUpvotes}
              />
            ) : feedStyle === 'groupView' && discussionShow ? (
              <NewDiscussionBoard group={activeGroup}  />
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
import React, { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';
import styles from './handleUpvote.module.css';
import { BiSolidUpvote } from "react-icons/bi";

const HandleUpvote = (WrappedComponent) => {
  const HandleUpvoteComponent = (props) => {
    const { user, addUpvoteToUser } = useUser();

    const handleUpvote = async (project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, tempUpvoteId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return false;
      }

      const payload = { user_id: user._id, project_id: project._id };

      try {
        const response = await fetch(`${config.apiBaseUrl}/upvoteProject`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          const actualUpvoteId = data._id;
          
          // Update state with actual upvote ID
          setProject(prevProject => ({
            ...prevProject,
            upvotes: prevProject.upvotes.map(id => id === tempUpvoteId ? actualUpvoteId : id),
          }));
          setPassedUser(prevUser => ({
            ...prevUser,
            upvotes: prevUser.upvotes.map(id => id === tempUpvoteId ? actualUpvoteId : id),
          }));
          setUserUpvotes(prevUpvotes => prevUpvotes.map(id => id === tempUpvoteId ? actualUpvoteId : id));

          // Create notification
          const notificationPayload = {
            user_id: project.user_id,
            type: 'upvote',
            message: `${user.username} upvoted ${project.projectName}!`,
            project_name: project.projectName,
            from_user: user.username,
            project_id: project._id,
            recipient_id: project.user_id,
          };
          await fetch(`${config.apiBaseUrl}/create_notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload)
          });
          return true;
        } else {
          console.error('Upvote failed:', data.message);
          return false;
        }
      } catch (error) {
        console.error('Error during upvote:', error);
        return false;
      }
    };

    const handleRemoveUpvote = async (project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, upvoteId) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return false;
      }

      const payload = { user_id: user._id, project_id: project._id, upvote_id: upvoteId };

      try {
        const response = await fetch(`${config.apiBaseUrl}/removeUpvote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          return true;
        } else {
          console.error('Remove upvote failed:', data.message);
          return false;
        }
      } catch (error) {
        console.error('Error during remove upvote:', error);
        return false;
      }
    };

    const findUpvoteOverlap = (project, userUpvotes) => {
      if (!user || !Array.isArray(userUpvotes) || !Array.isArray(project.upvotes)) {
        return false;
      }
      const overlap = userUpvotes.find(userUpvote => project.upvotes.includes(userUpvote));
      return overlap || false;
    };

    const UpvoteButton = ({ project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes }) => {
      const [isProcessing, setIsProcessing] = useState(false);
      const [localUpvoteOverlap, setLocalUpvoteOverlap] = useState(() => findUpvoteOverlap(project, userUpvotes));
    
      const handleClick = useCallback(async () => {
        if (isProcessing) return;
    
        setIsProcessing(true);
        const tempUpvoteId = `temp-${Date.now()}`;
        const prevUpvotes = project.upvotes;
        const prevUserUpvotes = userUpvotes;

        // Optimistic update
        if (localUpvoteOverlap) {
          setProject(prevProject => ({
            ...prevProject,
            upvotes: prevProject.upvotes.filter(id => id !== localUpvoteOverlap),
          }));
          setPassedUser(prevUser => ({
            ...prevUser,
            upvotes: prevUser.upvotes.filter(id => id !== localUpvoteOverlap),
          }));
          setUserUpvotes(prevUpvotes => prevUpvotes.filter(id => id !== localUpvoteOverlap));
          setLocalUpvoteOverlap(false);
        } else {
          setProject(prevProject => ({
            ...prevProject,
            upvotes: [...prevProject.upvotes, tempUpvoteId],
          }));
          setPassedUser(prevUser => ({
            ...prevUser,
            upvotes: [...prevUser.upvotes, tempUpvoteId],
          }));
          setUserUpvotes(prevUpvotes => [...prevUpvotes, tempUpvoteId]);
          setLocalUpvoteOverlap(tempUpvoteId);
        }

        // Perform the actual API call
        const success = localUpvoteOverlap
          ? await handleRemoveUpvote(project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, localUpvoteOverlap)
          : await handleUpvote(project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, tempUpvoteId);

        if (!success) {
          // Revert changes if the API call failed
          setProject(prevProject => ({ ...prevProject, upvotes: prevUpvotes }));
          setPassedUser(prevUser => ({ ...prevUser, upvotes: prevUserUpvotes }));
          setUserUpvotes(prevUserUpvotes);
          setLocalUpvoteOverlap(localUpvoteOverlap);
        }

        setIsProcessing(false);
      }, [isProcessing, project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, localUpvoteOverlap]);
    
      return (
        <div className={styles.upvoteButtonBox}>
          <p className={styles.upvoteNumber}>{project.upvotes ? project.upvotes.length : 0}</p>
          <button
            className={localUpvoteOverlap ? styles.clickedUpvoteButton : styles.upvoteButton}
            onClick={handleClick}
            disabled={isProcessing}
          >
            <BiSolidUpvote />
          </button>
        </div>
      );
    };

    return (
      <WrappedComponent
        {...props}
        UpvoteButton={UpvoteButton}
      />
    );
  };

  return HandleUpvoteComponent;
};

export default HandleUpvote;
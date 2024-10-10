import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';
import styles from './handleUpvote.module.css';
import { BiSolidUpvote } from "react-icons/bi";

const HandleUpvote = (WrappedComponent) => {
  const HandleUpvoteComponent = (props) => {
    const { user, addUpvoteToUser } = useUser();

    const handleUpvote = async (project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, setIsProcessing) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }

      const payload = { user_id: user._id, project_id: project._id };
      const tempUpvoteId = `temp-${Date.now()}`;

      // Optimistic update
      setProject(prevProject => ({
        ...prevProject,
        upvotes: [...(prevProject.upvotes || []), tempUpvoteId],
      }));
      setPassedUser(prevUser => ({
        ...prevUser,
        upvotes: [...(prevUser.upvotes || []), tempUpvoteId],
      }));
      setUserUpvotes(prevUpvotes => [...prevUpvotes, tempUpvoteId]);

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
        } else {
          // Revert optimistic update if upvote failed
          setProject(prevProject => ({
            ...prevProject,
            upvotes: prevProject.upvotes.filter(id => id !== tempUpvoteId),
          }));
          setPassedUser(prevUser => ({
            ...prevUser,
            upvotes: prevUser.upvotes.filter(id => id !== tempUpvoteId),
          }));
          setUserUpvotes(prevUpvotes => prevUpvotes.filter(id => id !== tempUpvoteId));
          console.error('Upvote failed:', data.message);
        }
      } catch (error) {
        // Revert optimistic update if there was an error
        setProject(prevProject => ({
          ...prevProject,
          upvotes: prevProject.upvotes.filter(id => id !== tempUpvoteId),
        }));
        setPassedUser(prevUser => ({
          ...prevUser,
          upvotes: prevUser.upvotes.filter(id => id !== tempUpvoteId),
        }));
        setUserUpvotes(prevUpvotes => prevUpvotes.filter(id => id !== tempUpvoteId));
        console.error('Error during upvote:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    const handleRemoveUpvote = async (project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, upvoteId, setIsProcessing) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }

      const payload = { user_id: user._id, project_id: project._id, upvote_id: upvoteId };

      // Optimistic update
      setProject(prevProject => ({
        ...prevProject,
        upvotes: prevProject.upvotes.filter(id => id !== upvoteId),
      }));
      setPassedUser(prevUser => ({
        ...prevUser,
        upvotes: prevUser.upvotes.filter(id => id !== upvoteId),
      }));
      setUserUpvotes(prevUpvotes => prevUpvotes.filter(id => id !== upvoteId));

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
        if (!response.ok) {
          // Revert optimistic update if remove upvote failed
          setProject(prevProject => ({
            ...prevProject,
            upvotes: [...prevProject.upvotes, upvoteId],
          }));
          setPassedUser(prevUser => ({
            ...prevUser,
            upvotes: [...prevUser.upvotes, upvoteId],
          }));
          setUserUpvotes(prevUpvotes => [...prevUpvotes, upvoteId]);
          console.error('Remove upvote failed:', data.message);
        }
      } catch (error) {
        // Revert optimistic update if there was an error
        setProject(prevProject => ({
          ...prevProject,
          upvotes: [...prevProject.upvotes, upvoteId],
        }));
        setPassedUser(prevUser => ({
          ...prevUser,
          upvotes: [...prevUser.upvotes, upvoteId],
        }));
        setUserUpvotes(prevUpvotes => [...prevUpvotes, upvoteId]);
        console.error('Error during remove upvote:', error);
      } finally {
        setIsProcessing(false);
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
      const upvoteOverlap = findUpvoteOverlap(project, userUpvotes);
    
      const handleClick = async () => {
        if (isProcessing) return;
    
        setIsProcessing(true);
        if (upvoteOverlap) {
          await handleRemoveUpvote(project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, upvoteOverlap, setIsProcessing);
        } else {
          await handleUpvote(project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes, setIsProcessing);
        }
      };
    
      return (
        <div className={styles.upvoteButtonBox}>
          <p className={styles.upvoteNumber}>{project.upvotes ? project.upvotes.length : 0}</p>
          <button
            className={upvoteOverlap ? styles.clickedUpvoteButton : styles.upvoteButton}
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
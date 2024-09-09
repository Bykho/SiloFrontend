import React, { useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';
import styles from './handleUpvote.module.css';
import { BiSolidUpvote } from "react-icons/bi";

const HandleUpvote = (WrappedComponent) => {
  const HandleUpvoteComponent = (props) => {
    const { user, addUpvoteToUser } = useUser();

    const handleUpvote = async (project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
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
          console.log('actualUpvoteID: ', actualUpvoteId);
          
          // Update state with actual upvote ID
          setProject((prevProject) => ({
            ...prevProject,
            upvotes: [...(prevProject.upvotes || []), actualUpvoteId],
          }));
          setPassedUser((prevUser) => ({
            ...prevUser,
            upvotes: [...(prevUser.upvotes || []), actualUpvoteId],
          }));
          setUserUpvotes((prevUpvotes) => [...prevUpvotes, actualUpvoteId]);

          // Create a notification after upvoting the project
          const notificationPayload = {
            user_id: project.user_id,
            type: 'upvote',
            message: `${user.username} upvoted ${project.projectName}!`,
            project_name: project.projectName,
            from_user: user.username,
            project_id: project._id,
            recipient_id: project.user_id,
          };
          const notificationResponse = await fetch(`${config.apiBaseUrl}/create_notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload)
          });
          if (!notificationResponse.ok) throw new Error('Failed to create notification');
          console.log('Notification created successfully');
        } else {
          console.error('Upvote failed:', data.message);
        }
      } catch (error) {
        console.error('Error during upvote:', error);
      }
    };

    const findUpvoteOverlap = (project, userUpvotes) => {
      console.log('findUpvoteOverlap: project', project)
      console.log('findUpvoteOverlap: userUpvotes', userUpvotes)
      if (!user || !Array.isArray(userUpvotes) || !Array.isArray(project.upvotes)) {
        return false;
      }
      return userUpvotes.some(userUpvote => project.upvotes.includes(userUpvote));
    };

    const UpvoteButton = ({ project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes }) => {
      useEffect(() => {
        console.log('HandleUpvote b4 findUpvoteOverlap userUpvotes: ', userUpvotes);  // Correct placement of useEffect
      }, [userUpvotes]);

      return (
        <div className={styles.upvoteButtonBox}>
          <p className={styles.upvoteNumber}>{project.upvotes ? project.upvotes.length : 0}</p>
          <button
            className={findUpvoteOverlap(project, userUpvotes) ? styles.clickedUpvoteButton : styles.upvoteButton}
            onClick={() => handleUpvote(project, setProject, passedUser, setPassedUser, userUpvotes, setUserUpvotes)}
            disabled={findUpvoteOverlap(project, userUpvotes)}
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

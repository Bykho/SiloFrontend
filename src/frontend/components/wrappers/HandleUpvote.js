

import React from 'react';
import { useUser } from '../../contexts/UserContext';
import config from '../../config';
import styles from './handleUpvote.module.css';
import { BiSolidUpvote } from "react-icons/bi";


const HandleUpvote = (WrappedComponent) => {
  const HandleUpvoteComponent = (props) => {
    const { user, addUpvoteToUser } = useUser();

    const handleUpvote = async (project, setProject, passedUser, setPassedUser) => {
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
          console.log('actualUpvoteID: ', actualUpvoteId)
          // Update state with actual upvote ID
          setProject((prevProject) => ({
            ...prevProject,
            upvotes: [...(prevProject.upvotes || []), actualUpvoteId],
          }));
          setPassedUser((prevUser) => ({
            ...prevUser,
            upvotes: [...(prevUser.upvotes || []), actualUpvoteId],
          }));
          console.log("Updating user context with upvotes:", actualUpvoteId);
          addUpvoteToUser(actualUpvoteId);
        } else {
          console.error('Upvote failed:', data.message);
        }
      } catch (error) {
        console.error('Error during upvote:', error);
      }
    };

    const findUpvoteOverlap = (project) => {
      if (!Array.isArray(user.upvotes) || !Array.isArray(project.upvotes)) {
        return false;
      }
      return user.upvotes.some(userUpvote => project.upvotes.includes(userUpvote));
    };

    const UpvoteButton = ({ project, setProject, passedUser, setPassedUser }) => (
      <div className={styles.upvoteButtonBox}>
        <p className={styles.upvoteNumber}> {project.upvotes ? project.upvotes.length : 0}</p>
        <button
          className={findUpvoteOverlap(project) ? styles.clickedUpvoteButton : styles.upvoteButton}
          onClick={() => handleUpvote(project, setProject, passedUser, setPassedUser)}
          disabled={findUpvoteOverlap(project)}
        >
          <BiSolidUpvote />
        </button>
      </div>
    );

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






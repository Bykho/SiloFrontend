


import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './discussionBoard.module.css';
import config from '../../config'; // Ensure this path is correct for your project

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

const DiscussionBoard = ({ group }) => {
  const [commentJson, setCommentJson] = useState(group.comment_json ? convertObjectIdToString(group.comment_json) : {});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    console.log('Group parameter in DiscussionBoard:', group);
  }, [group]);

  const handleAddComment = async (title) => {
    if (newComment.trim() !== '') {
      const token = localStorage.getItem('token');
      const commentData = { text: newComment, groupId: group._id, title };
      try {
        const response = await fetch(`${config.apiBaseUrl}/handleGroupComment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });
        const data = await response.json();
        if (response.ok) {
          setCommentJson(prevCommentJson => ({
            ...prevCommentJson,
            [title]: data.updatedComments
          }));
          setNewComment('');
        } else {
          console.error('Failed to add comment:', data.error);
        }
      } catch (error) {
        console.error('Error during adding comment:', error);
      }
    }
  };

  return (
    <div className={styles.discussionBoardContainer}>
      <h2>Discussion Board for {group.name}</h2>
      {commentJson && Object.keys(commentJson).length > 0 ? (
        <div className={styles.commentJsonContainer}>
          {Object.entries(commentJson).map(([title, content], index) => (
            <div key={index} className={styles.commentSection}>
              <h3 className={styles.commentTitle}>{title}</h3>
              <div className={styles.commentContent}>
                {Object.entries(content).map(([key, value]) => (
                  <p key={key}>{value}</p>
                ))}
              </div>
              <div className={styles.commentInputContainer}>
                <input
                  type="text"
                  placeholder="Add comment"
                  className={styles.commentInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className={styles.addCommentButton}
                  onClick={() => handleAddComment(title)}
                >
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No comments available</p>
      )}
    </div>
  );
};

DiscussionBoard.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string.isRequired,
    comment_json: PropTypes.object,
  }).isRequired,
};

export default DiscussionBoard;






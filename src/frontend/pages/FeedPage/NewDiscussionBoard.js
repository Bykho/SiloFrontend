


import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './newDiscussionBoard.module.css';
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
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Group parameter in DiscussionBoard:', group);
  }, [group]);

  useEffect(() => {
    const fetchComments = async () => {
      const allCommentIds = Object.values(commentJson).flat();
      if (allCommentIds.length === 0) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/getCommentsByIds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentIds: allCommentIds }),
      });

      if (response.ok) {
        const data = await response.json();
        const commentsMap = data.reduce((acc, comment) => {
          acc[comment._id] = comment;
          return acc;
        }, {});
        setComments(commentsMap);
      } else {
        console.error('Failed to fetch comments');
      }

      setLoading(false);
    };

    fetchComments();
  }, [commentJson]);

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

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className={styles.discussionBoardContainer}>
      {commentJson && Object.keys(commentJson).length > 0 ? (
        <div className={styles.commentJsonContainer}>
          {Object.entries(commentJson).map(([title, content], index) => (
            <div key={index} className={styles.commentSection}>
              <h3 className={styles.commentTitle}>Discussion</h3>
              <div className={styles.commentList}>
                {content.map((commentId) => (
                  <div key={commentId} className={styles.commentCard}>
                    {comments[commentId] ? (
                      <>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{comments[commentId].author}</span>
                        </div>
                        <div className={styles.commentRow}>
                          <p className={styles.commentText}>{comments[commentId].text}</p>
                        </div>
                      </>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                ))}
              </div>
              <div className={styles.commentInputContainer}>
                <input
                  type="text"
                  placeholder="Post a comment..."
                  className={styles.commentInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className={styles.addCommentButton}
                  onClick={() => handleAddComment(title)}
                >
                  Submit Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noComments}>No comments available</p>
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

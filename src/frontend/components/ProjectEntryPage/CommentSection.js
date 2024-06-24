


import React, { useState } from 'react';
import styles from './projectEntry.module.css';
import ProfileImage from '../ProfileImage';

const CommentSection = ({ comments, addComment, handleCommentUpvote, user }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (newComment.trim() !== '') {
      await addComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className={styles.commentsSection}>
      {comments.map((comment, index) => (
        <div key={index} className={styles.comment}>
          <div className={styles.commentProfileSection}>
            <ProfileImage username={comment.author} size="small" />
            <div className={styles.commentUpvoteSection}>
              <button className={styles.commentUpvoteButton} onClick={() => handleCommentUpvote(index)}>
                &#x2B06;
              </button>
              <span className={styles.commentUpvoteCount}>{comment.upvotes ? comment.upvotes.length : 0}</span>
            </div>
          </div>
          <div className={styles.commentContent}>
            <span className={styles.commentUser}>{comment.author}</span>
            <p>{comment.text}</p>
          </div>
        </div>
      ))}
      <div className={styles.addCommentSection}>
        <textarea
          className={styles.commentInput}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button className={styles.addCommentButton} onClick={handleAddComment}>
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default CommentSection;



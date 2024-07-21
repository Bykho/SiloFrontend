



import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './discussionBoard.module.css';

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
  useEffect(() => {
    console.log('Group parameter in DiscussionBoard:', group);
  }, [group]);

  const commentJson = group.comment_json ? convertObjectIdToString(group.comment_json) : {};

  return (
    <div className={styles.discussionBoardContainer}>
      <h2>Discussion Board for {group.name}</h2>
      {commentJson && (
        <div className={styles.commentJsonContainer}>
          <pre>{JSON.stringify(commentJson, null, 2)}</pre>
        </div>
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



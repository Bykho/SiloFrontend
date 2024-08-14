import React, { useState, useEffect } from 'react';
import styles from './leaderboardView.module.css';
import { FaAward, FaTrophy } from 'react-icons/fa';
import ProfileImage from './ProfileImage';

const LeaderboardView = ({ users, navigate, fetchProjectsForUser }) => {
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('LEADERBOARDVIEW.js here is users: ', users)
  }, [users])

  useEffect(() => {
    const calculateScores = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Starting score calculation for', users.length, 'users');
        const usersWithScores = await Promise.all(users.map(async (user) => {
          try {
            console.log('Processing user:', user.username);

            let score = 0;
            if (user.scores && user.scores.length > 0) {
              const lastScoreDict = user.scores[user.scores.length - 1]; // Get the last element in the scores array
              score = Object.values(lastScoreDict).reduce((sum, value) => sum + value, 0); // Sum all values in the dictionary
            }

            console.log('Calculated score for user:', user.username, 'Score:', score);
            return { ...user, score };
          } catch (userError) {
            console.error('Error processing user:', user.username, userError);
            return { ...user, score: 0 };
          }
        }));

        console.log('Sorting users by score');
        const sortedUsers = usersWithScores.sort((a, b) => b.score - a.score);
        console.log('Sorted users:', sortedUsers);
        setLeaderboardUsers(sortedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Failed to calculate scores:', err);
        setError('Failed to calculate scores: ' + err.message);
        setLoading(false);
      }
    };

    calculateScores();
  }, [users, fetchProjectsForUser]);

  if (loading) return <div className={styles.loadingSpinner}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.leaderboardContainer}>
      <h2 className={styles.leaderboardTitle}>
        <FaTrophy className={styles.trophyIcon} /> Leaderboard
      </h2>
      <div className={styles.leaderboardList}>
        {leaderboardUsers.map((user, index) => (
          <div
            key={user._id}
            className={`${styles.leaderboardItem} ${index < 3 ? styles[`top${index + 1}`] : ''}`}
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <div className={styles.rank}>{index + 1}</div>
            <div className={styles.userInfoWrapper}>
              <ProfileImage username={user.username} size='small' />
              <div className={styles.userInfo}>
                <span className={styles.username}>{user.username}</span>
                <span className={styles.userType}>{user.user_type}</span>
              </div>
            </div>
            <div className={styles.score}>
              <FaAward className={styles.scoreIcon} />
              {user.score}
            </div>
            <div className={styles.glowBar}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;
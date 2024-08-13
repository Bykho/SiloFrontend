import React, { useState, useEffect } from 'react';
import styles from './leaderboardView.module.css';
import { FaAward, FaTrophy } from 'react-icons/fa';
import ProfileImage from './ProfileImage';

const LeaderboardView = ({ users, navigate, fetchProjectsForUser }) => {
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const calculateScores = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Starting score calculation for', users.length, 'users');
        const usersWithScores = await Promise.all(users.map(async (user) => {
          try {
            console.log('Processing user:', user.username);
            console.log('User portfolio:', user.portfolio);
            
            if (!user.portfolio || user.portfolio.length === 0) {
              console.log('User has no projects in portfolio');
              return { ...user, score: 0 };
            }

            const projects = await fetchProjectsForUser(user.portfolio);
            console.log('Projects fetched for user:', user.username, 'Count:', projects.length);
            console.log('Projects:', projects);

            let totalUpvotes = 0;
            projects.forEach(project => {
              console.log('Project:', project._id);
              console.log('Project upvotes:', project.upvotes);
              const upvotes = project.upvotes ? project.upvotes.length : 0;
              console.log('Upvotes for this project:', upvotes);
              totalUpvotes += upvotes;
            });

            console.log('Total upvotes for user:', user.username, 'Score:', totalUpvotes * 10);
            return { ...user, score: totalUpvotes * 10 };
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
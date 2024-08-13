import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './userSpiderPlot.module.css';

const PlayerRatingSpiderweb = ({ playerData }) => {
  const data = [
    { category: 'Theory', value: playerData.theory },
    { category: 'Practicum', value: playerData.practicum },
    { category: 'Collaboration', value: playerData.collaboration },
    { category: 'Entrepreneurship', value: playerData.entrepreneurship },
    { category: 'Technical Depth', value: playerData.technicalDepth },
  ];

  const totalScore = Object.values(playerData).reduce((sum, value) => sum + value, 0);
  const averageScore = totalScore / Object.keys(playerData).length;
  const userValue = Math.round(averageScore * 1000);

  const suggestions = [
    "Participate in more collaborative projects to boost your collaboration score.",
    "Deepen your technical knowledge in specific areas to increase your technical depth.",
    "Engage in practical applications of your skills to improve your practicum score.",
    "Study more theoretical concepts to enhance your theory score.",
    "Explore entrepreneurial opportunities to raise your entrepreneurship score.",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <h2 className={styles.title}>User Rating</h2>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#4a5568" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#a0aec0' }} />
            <Radar
              name="Player"
              dataKey="value"
              stroke="#3182ce"
              fill="#3182ce"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.rightColumn}>
        <h2 className={styles.title}>User Rating Breakdown</h2>
        <div className={styles.statSection}>
          <h3 className={styles.subTitle}>Score Breakdown</h3>
          <div className={styles.scoreTable}>
            {Object.entries(playerData).map(([key, value]) => (
              <div key={key} className={styles.scoreRow}>
                <span className={styles.scoreCategory}>{key}</span>
                <div className={styles.scoreBarContainer}>
                  <div className={styles.scoreBar} style={{width: `${value}%`}}></div>
                  <span className={styles.scoreValue}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.statSection}>
          <div className={styles.overallStats}>
            <div className={styles.statItem}>
              <h3 className={styles.statLabel}>Total Score</h3>
              <span className={styles.statValue}>{totalScore}</span>
            </div>
            <div className={styles.statItem}>
              <h3 className={styles.statLabel}>User Value Estimate</h3>
              <span className={styles.statValue}>${userValue}</span>
            </div>
          </div>
        </div>
        <div className={styles.statSection}>
          <h3 className={styles.subTitle}>Improvement Suggestions</h3>
          <ul className={styles.suggestionList}>
            {suggestions.map((suggestion, index) => (
              <li key={index} className={styles.suggestionItem}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerRatingSpiderweb;
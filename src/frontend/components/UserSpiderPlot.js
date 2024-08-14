import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './userSpiderPlot.module.css';
import config from '../config';

const PlayerRatingSpiderweb = ({ playerData, userData }) => {
  const [data, setData] = useState([
    { category: 'Theory', value: playerData.theory },
    { category: 'Practicum', value: playerData.practicum },
    { category: 'Collaboration', value: playerData.collaboration },
    { category: 'Entrepreneurship', value: playerData.entrepreneurship },
    { category: 'Technical Depth', value: playerData.technicalDepth },
  ]);

  const totalScore = data.reduce((sum, { value }) => sum + value, 0);
  const averageScore = totalScore / data.length;  
  const userValue = Math.round(averageScore * 1000);


  //build out below
  const suggestions = [
    "Participate in more collaborative projects to boost your collaboration score.",
    "Deepen your technical knowledge in specific areas to increase your technical depth.",
    "Engage in practical applications of your skills to improve your practicum score.",
    "Study more theoretical concepts to enhance your theory score.",
    "Explore entrepreneurial opportunities to raise your entrepreneurship score.",
  ];


  useEffect(() => {
    console.log('SPIDERPLOT.js userData: ', userData)
  }, [userData])
  const [vsscoreData, setVsScoreData] = useState([]);

  const handleButtonClick = async () => {
    let parsedUserData;
    if (typeof userData === 'string') {
      try {
        parsedUserData = JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse userData:', error);
        return;
      }
    } else {
      parsedUserData = userData;
    }

    const filterPortfolio = (data) => {
      if (Array.isArray(data)) {
        return data
          .map(item => filterPortfolio(item))
          .filter(item => item !== null);
      } else if (typeof data === 'object' && data !== null) {
        if (data.type === 'image') {
          return null;
        } else {
          const filteredObject = {};
          for (const key in data) {
            const filteredValue = filterPortfolio(data[key]);
            if (filteredValue !== null) {
              filteredObject[key] = filteredValue;
            }
          }
          return filteredObject;
        }
      } else {
        return data;
      }
    };

    const filteredPortfolio = filterPortfolio(parsedUserData.portfolio);

    const newVsScoreData = {
      skills: parsedUserData.skills,
      interests: parsedUserData.interests,
      portfolio: filteredPortfolio,
      major: parsedUserData.major,
    };

    setVsScoreData(newVsScoreData);
    console.log('VSscoreData: ', newVsScoreData);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/VSprofileScore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newVsScoreData),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from VSprofileScore');
      }

      const result = await response.json();
      console.log('Here is the result: ', result);

      // Update the data state with the new scores
      const updatedData = data.map(item => {
        if (result[item.category]) {
          return { ...item, value: result[item.category] };
        }
        return item;
      });

      setData(updatedData);

    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };
  
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
        <button onClick={handleButtonClick} className={styles.button}>Populate VSscore Data</button>
        <pre>{JSON.stringify(vsscoreData, null, 2)}</pre>
      </div>
      <div className={styles.rightColumn}>
        <h2 className={styles.title}>User Rating Breakdown</h2>
        <div className={styles.statSection}>
          <h3 className={styles.subTitle}>Score Breakdown</h3>
          <div className={styles.scoreTable}>
            {data.map(({ category, value }) => (
              <div key={category} className={styles.scoreRow}>
                <span className={styles.scoreCategory}>{category}</span>
                <div className={styles.scoreBarContainer}>
                  <div className={styles.scoreBar} style={{ width: `${value}%` }}></div>
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
              <span className={styles.statValue}>{totalScore} / 500</span>
            </div>
{/*}            <div className={styles.statItem}>
              <h3 className={styles.statLabel}>User Value Estimate</h3>
              <span className={styles.statValue}>${userValue}</span>
            </div>
*/}
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
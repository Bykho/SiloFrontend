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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Player Rating</h2>
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
  );
};

export default PlayerRatingSpiderweb;
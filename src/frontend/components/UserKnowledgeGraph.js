import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import styles from './userKnowledgeGraph.module.css';

// Sample data - replace this with your actual data
const sampleData = {
  nodes: [
    { id: 'User1', group: 1 },
    { id: 'User2', group: 2 },
    { id: 'User3', group: 1 },
    { id: 'JavaScript', group: 3 },
    { id: 'React', group: 3 },
    { id: 'Node.js', group: 3 },
    { id: 'Python', group: 3 },
    { id: 'Machine Learning', group: 3 },
  ],
  links: [
    { source: 'User1', target: 'JavaScript' },
    { source: 'User1', target: 'React' },
    { source: 'User2', target: 'JavaScript' },
    { source: 'User2', target: 'Node.js' },
    { source: 'User3', target: 'Python' },
    { source: 'User3', target: 'Machine Learning' },
  ]
};

const UserKnowledgeGraph = () => {
  const [darkMode, setDarkMode] = useState(false);
  const graphRef = useRef();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const bgColor = useMemo(() => darkMode ? '#1a1a1a' : '#ffffff', [darkMode]);
  const nodeColor = useMemo(() => darkMode ? '#00aaff' : '#ff6600', [darkMode]);
  const textColor = useMemo(() => darkMode ? '#ffffff' : '#000000', [darkMode]);

  useEffect(() => {
    document.body.classList.toggle(styles.darkMode, darkMode);
  }, [darkMode]);

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      sampleData.links.forEach(link => {
        if (link.source === node || link.target === node) {
          highlightNodes.add(link.source);
          highlightNodes.add(link.target);
          highlightLinks.add(link);
        }
      });
    }

    setHoverNode(node || null);
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
    
    if (graphRef.current) {
      graphRef.current.refresh();
    }
  };

  return (
    <div className={`${styles.graphContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.graphHeader}>
        <span>User Knowledge Graph</span>
        <div className={styles.darkModeToggle}>
          <span className={styles.sunIcon}>☀️</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className={`${styles.slider} ${styles.round}`}></span>
          </label>
          <span className={styles.moonIcon}>🌙</span>
        </div>
      </div>
      <div className={styles.graphContent}>
        <ForceGraph2D
          ref={graphRef}
          graphData={sampleData}
          backgroundColor={bgColor}
          nodeRelSize={6}
          nodeColor={node => highlightNodes.has(node) ? nodeColor : darkMode ? '#888' : '#bbb'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node === hoverNode ? nodeColor : textColor;
            ctx.fillText(label, node.x, node.y + 8);
          }}
          linkWidth={link => highlightLinks.has(link) ? 2 : 1}
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 2 : 0}
          linkColor={() => darkMode ? '#ffffff' : '#000000'}
          onNodeHover={handleNodeHover}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current.zoomToFit(400)}
        />
      </div>
    </div>
  );
};

export default UserKnowledgeGraph;
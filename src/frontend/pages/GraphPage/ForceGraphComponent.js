import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import styles from './ForceGraphComponent.module.css';
import config from '../../config';

const ForceGraphComponent = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fgRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/userFilteredSearch/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const userData = await response.json();
        
        // Transform user data into graph data
        const nodes = userData.map(user => ({
          id: user._id,
          name: user.username,
          group: user.user_type === 'student' ? 1 : 2,
          user_type: user.user_type,
          email: user.email,
          interests: user.interests || []
        }));

        // Create links based on shared interests
        const links = [];
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const sharedInterests = nodes[i].interests.filter(interest => 
              nodes[j].interests.includes(interest)
            );
            if (sharedInterests.length > 0) {
              links.push({
                source: nodes[i].id,
                target: nodes[j].id,
                value: sharedInterests.length
              });
            }
          }
        }

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const updateHighlight = () => {
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  };

  const handleNodeHover = (node) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors?.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links?.forEach((link) => highlightLinks.add(link));
    }
    updateHighlight();
  };

  const handleLinkHover = (link) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }
    updateHighlight();
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 14 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const borderWidth = 2;
    const nodeDiameter = Math.max(textWidth + 16, 50);
    const nodeRadius = nodeDiameter / 2;

    node.r = nodeRadius;

    // Draw outer circle (border)
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius + borderWidth, 0, 2 * Math.PI);
    ctx.fillStyle = highlightNodes.has(node) ? '#00FFFF' : (node.group === 1 ? '#4169E1' : '#1e7de9');
    ctx.fill();

    // Draw inner circle (background)
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#2D3748';
    ctx.fill();

    // Draw text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(label, node.x, node.y);

    node.__bckgDimensions = [nodeDiameter, nodeDiameter];
  }, [highlightNodes]);

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    const bckgDimensions = node.__bckgDimensions;
    if (bckgDimensions) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, bckgDimensions[0] / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, []);

  const applyForces = useCallback(() => {
    const fg = fgRef.current;
    if (fg) {
      // Custom force to prevent node overlap
      const forceNoOverlap = (alpha) => {
        const nodes = graphData.nodes;
        for (let i = 0; i < nodes.length; i++) {
          const node1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const node2 = nodes[j];
            const dx = node2.x - node1.x;
            const dy = node2.y - node1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (node1.r || 25) + (node2.r || 25) + 5; // Add extra spacing

            if (distance < minDistance) {
              const factor = (minDistance - distance) / distance * 0.5 * alpha;
              node1.x -= dx * factor;
              node1.y -= dy * factor;
              node2.x += dx * factor;
              node2.y += dy * factor;
            }
          }
        }
      };

      // Increase repulsion at the graph boundaries
      const boundaryForce = (alpha) => {
        const width = fg.width;
        const height = fg.height;
        const padding = 50;
        const strength = 0.05;

        graphData.nodes.forEach((node) => {
          if (node.x < padding) node.vx += strength * alpha;
          if (node.x > width - padding) node.vx -= strength * alpha;
          if (node.y < padding) node.vy += strength * alpha;
          if (node.y > height - padding) node.vy -= strength * alpha;
        });
      };

      fg.d3Force('charge').strength(-300);
      fg.d3Force('link').distance(100);
      fg.d3Force('center', null);
      fg.d3Force('collision', forceNoOverlap);
      fg.d3Force('boundary', boundaryForce);
    }
  }, [graphData]);

  useEffect(() => {
    if (!loading && fgRef.current) {
      applyForces();
    }
  }, [loading, applyForces]);

  if (loading) {
    return <div className={styles.loadingSpinner}></div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.graphContainer}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={20}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => '#4169E1'}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        onNodeClick={handleNodeClick}
        backgroundColor="#1a202c"
        cooldownTicks={100}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
      {selectedNode && (
        <div className={styles.alert}>
          <div className={styles.alertIcon}>ℹ️</div>
          <div className={styles.alertContent}>
            <h4 className={styles.alertTitle}>Selected User</h4>
            <p className={styles.alertDescription}>
              {selectedNode.name} ({selectedNode.user_type})
              <br />
              Email: {selectedNode.email}
              <br />
              Interests: {selectedNode.interests.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceGraphComponent;
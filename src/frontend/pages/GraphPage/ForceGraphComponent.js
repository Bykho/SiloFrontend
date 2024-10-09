import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3-force';
import styles from './ForceGraphComponent.module.css';
import config from '../../config';
import { useUser } from '../../contexts/UserContext';

const ForceGraphComponent = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fgRef = useRef();
  const { user } = useUser();
  const myUsername = user ? user.username : '';
  const mySkills = user ? user.skills : [];
  const myInterests = user ? user.interests : [];
  const myUserId = user ? user._id : '';
  const myUserType = user ? user.user_type : '';
  const myEmail = user ? user.email : '';

  const applyForces = useCallback(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force('charge').strength(-200);
      fg.d3Force('link').distance(150);
      fg.d3Force('collide', d3.forceCollide(50).strength(1));
      fg.d3Force('center', d3.forceCenter(0, 0).strength(0.1));
    }
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');

        // Fetch the current user's projects
        const userProjectsResponse = await fetch(`${config.apiBaseUrl}/returnUserProjects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: myUserId }),
        });

        if (!userProjectsResponse.ok) {
          throw new Error('Failed to fetch user projects');
        }

        const userProjectsData = await userProjectsResponse.json();
        // userProjectsData is an array of projects with _id and projectName

        // Extract project IDs
        const userProjectIds = userProjectsData.map(project => project._id);

        // Fetch full project details
        const projectsResponse = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIds: userProjectIds }),
        });

        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch project details');
        }

        const userProjects = await projectsResponse.json();

        // Get similar projects for user's projects
        // Note: This endpoint needs to be implemented in your backend
        const similarProjectsBatchResponse = await fetch(`${config.apiBaseUrl}/getSimilarProjectsBatch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIds: userProjectIds }),
        });

        if (!similarProjectsBatchResponse.ok) {
          throw new Error('Failed to fetch similar projects');
        }

        const similarProjectsMap = await similarProjectsBatchResponse.json();
        // similarProjectsMap is an object mapping each user project ID to an array of similar project IDs

        // Collect all similar project IDs
        const similarProjectIdsSet = new Set();
        for (const projectId in similarProjectsMap) {
          similarProjectsMap[projectId].forEach(similarProjectId => {
            if (!userProjectIds.includes(similarProjectId)) {
              similarProjectIdsSet.add(similarProjectId);
            }
          });
        }
        const similarProjectIds = Array.from(similarProjectIdsSet);

        // Fetch details of similar projects
        const similarProjectsResponse = await fetch(`${config.apiBaseUrl}/returnProjectsFromIds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIds: similarProjectIds }),
        });

        if (!similarProjectsResponse.ok) {
          throw new Error('Failed to fetch similar project details');
        }

        const similarProjects = await similarProjectsResponse.json();

        // Collect author IDs
        const authorIdsSet = new Set();
        similarProjects.forEach(project => {
          if (project.user_id && project.user_id !== myUserId) {
            authorIdsSet.add(project.user_id);
          }
        });
        const authorIds = Array.from(authorIdsSet);

        // Fetch author details
        const authorsResponse = await fetch(`${config.apiBaseUrl}/getUsersByIds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIds: authorIds }),
        });

        if (!authorsResponse.ok) {
          throw new Error('Failed to fetch author details');
        }

        const authors = await authorsResponse.json();

        // Build the graph nodes and links
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // Add current user node
        const currentUserNode = {
            id: myUserId,
            name: myUsername,
            type: 'user',
            group: 'currentUser',
            skills: mySkills,
            interests: myInterests,
            user_type: myUserType,
            email: myEmail,
          };

        nodes.push(currentUserNode);
        nodeMap.set(myUserId, currentUserNode);

        // Add user's projects
        userProjects.forEach(project => {
          const projectNode = {
            id: project._id,
            name: project.projectName,
            type: 'project',
            createdBy: project.createdBy,
            createdById: project.user_id,
            tags: project.tags || [],
          };
          nodes.push(projectNode);
          nodeMap.set(project._id, projectNode);

          // Link from user to project
          links.push({
            source: myUserId,
            target: project._id,
            type: 'user-project',
          });
        });

        // Add similar projects
        similarProjects.forEach(project => {
          if (!nodeMap.has(project._id)) {
            const projectNode = {
              id: project._id,
              name: project.projectName,
              type: 'project',
              createdBy: project.createdBy,
              createdById: project.user_id,
              tags: project.tags || [],
            };
            nodes.push(projectNode);
            nodeMap.set(project._id, projectNode);
          }
        });

        // Add authors
        authors.forEach(author => {
          if (!nodeMap.has(author._id)) {
            const authorNode = {
              id: author._id,
              name: author.username,
              type: 'user',
              group: 'otherUser',
              skills: author.skills || [],
              interests: author.interests || [],
              user_type: author.user_type,
              email: author.email,
            };
            nodes.push(authorNode);
            nodeMap.set(author._id, authorNode);
          }
        });

        // Build links between user's projects and similar projects
        for (const userProjectId in similarProjectsMap) {
          const similarProjectIdsForUserProject = similarProjectsMap[userProjectId] || [];
          similarProjectIdsForUserProject.forEach(similarProjectId => {
            links.push({
              source: userProjectId,
              target: similarProjectId,
              type: 'project-project',
            });
          });
        }

        // Link similar projects to their authors
        similarProjects.forEach(project => {
          if (project.user_id) {
            links.push({
              source: project._id,
              target: project.user_id,
              type: 'project-owner',
            });
          }
        });

        // Optionally, you can continue this pattern to include authors' other projects
        // For brevity, this example stops here

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch graph data');
        setLoading(false);
      }
    };
    fetchGraphData();
  }, [myUserId]);

  useEffect(() => {
    if (!loading && fgRef.current) {
      applyForces();
    }
  }, [loading, applyForces]);

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

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const label = node.name;
      const fontSize = 14 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const nodeDiameter = 50;
      const nodeRadius = nodeDiameter / 2;
      node.r = nodeRadius;

      // Determine color based on node type and group
      let fillColor = '#2D3748'; // Node background
      let borderColor = '#4169E1'; // Default border color

      if (node.type === 'user') {
        if (node.group === 'currentUser') {
          borderColor = '#FF0000'; // Current user - Red
        } else {
          borderColor = '#1e7de9'; // Other users - Blue
        }
      } else if (node.type === 'project') {
        if (node.createdById === myUserId) {
          borderColor = '#00FF00'; // Current user's projects - Green
        } else {
          borderColor = '#FFA500'; // Other users' projects - Orange
        }
      }

      // Draw outer circle (border)
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = highlightNodes.has(node) ? '#00FFFF' : borderColor;
      ctx.fill();

      // Draw inner circle (background)
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(label, node.x, node.y);

      node.__bckgDimensions = [nodeDiameter, nodeDiameter];
    },
    [highlightNodes, myUserId]
  );

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    const bckgDimensions = node.__bckgDimensions;
    if (bckgDimensions) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, bckgDimensions[0] / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, []);

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
            <h4 className={styles.alertTitle}>
              {selectedNode.type === 'user' ? 'Selected User' : 'Selected Project'}
            </h4>
            <p className={styles.alertDescription}>
              {selectedNode.type === 'user' ? (
                <>
                  {selectedNode.name} ({selectedNode.user_type})
                  <br />
                  Email: {selectedNode.email}
                  <br />
                  Skills: {selectedNode.skills.join(', ')}
                  <br />
                  Interests: {selectedNode.interests.join(', ')}
                </>
              ) : (
                <>
                  Project: {selectedNode.name}
                  <br />
                  Created By: {selectedNode.createdBy}
                  <br />
                  Tags: {selectedNode.tags.join(', ')}
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceGraphComponent;

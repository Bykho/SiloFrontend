import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3-force';
import styles from './ForceGraphComponent.module.css';
import config from '../../config';
import { useUser } from '../../contexts/UserContext';
import CleanOrbitingRingLoader from '../../components/FractalLoadingBar';

const ForceGraphComponent = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fgRef = useRef();
  const { user } = useUser();
  const myUserId = user ? user._id : null;
  const myUsername = user ? user.username : '';
  const mySkills = user && user.skills ? user.skills : [];
  const myInterests = user && user.interests ? user.interests : [];
  const myUserType = user ? user.user_type : '';
  const myEmail = user ? user.email : '';

  const applyForces = useCallback(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force('charge').strength(-200);
      fg.d3Force('link').distance(150);
      fg.d3Force('collide', d3.forceCollide(30).strength(0.7));
    }
  }, []);

  useEffect(() => {
    if (!myUserId) return; // Ensure user ID is available
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

        // Get similar research papers for user's projects
        const similarResearchPapersBatchResponse = await fetch(`${config.apiBaseUrl}/getSimilarResearchPapersBatch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIds: userProjectIds }),
        });

        if (!similarResearchPapersBatchResponse.ok) {
          throw new Error('Failed to fetch similar research papers');
        }

        const similarResearchPapersMap = await similarResearchPapersBatchResponse.json();
        console.log('Similar Research Papers Map:', similarResearchPapersMap);
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

        // Collect all similar research paper IDs
        const similarResearchPaperIdsSet = new Set();
        for (const projectId in similarResearchPapersMap) {
          similarResearchPapersMap[projectId].forEach(similarResearchPaperId => {
            similarResearchPaperIdsSet.add(similarResearchPaperId);
          });
        }
        const similarResearchPaperIds = Array.from(similarResearchPaperIdsSet);

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

        // Fetch details of similar research papers
        const similarResearchPapersResponse = await fetch(`${config.apiBaseUrl}/returnResearchPapersFromIds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ researchPaperIds: similarResearchPaperIds }),
        });

        if (!similarResearchPapersResponse.ok) {
          throw new Error('Failed to fetch similar research paper details');
        }

        const similarResearchPapers = await similarResearchPapersResponse.json();
        console.log('Similar Research Papers:', similarResearchPapers);
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

      // Add similar research papers
      similarResearchPapers.forEach(paper => {
        if (!nodeMap.has(paper.arxiv_id)) {
          const paperNode = {
            id: paper.arxiv_id, // Use arXiv ID as the node ID
            name: paper.title,
            type: 'research',
            arxiv_id: paper.arxiv_id,
            mongo_id: paper.mongo_id,
          };
          console.log('Paper:', paperNode);
          nodes.push(paperNode);
          nodeMap.set(paper.arxiv_id, paperNode); // Update nodeMap with arXiv ID
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

        // Build links between user's projects and similar projects/research papers
        for (const userProjectId of userProjectIds) {
          const similarProjectIdsForUserProject = similarProjectsMap[userProjectId] || [];
          const similarResearchPaperIdsForUserProject = similarResearchPapersMap[userProjectId] || [];

          // Limit to top 4 combined similar items
          const combinedSimilarIds = [
            ...similarProjectIdsForUserProject.map(id => ({ id, type: 'project' })),
            ...similarResearchPaperIdsForUserProject.map(id => ({ id, type: 'research' })),
          ].slice(0, 4);

          combinedSimilarIds.forEach(item => {
            links.push({
              source: userProjectId,
              target: item.id, // Use item.id directly
              type: item.type === 'project' ? 'project-project' : 'project-research',
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

  const handleNodeHover = (node) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();
    if (node) {
      newHighlightNodes.add(node);
      node.neighbors?.forEach((neighbor) => newHighlightNodes.add(neighbor));
      node.links?.forEach((link) => newHighlightLinks.add(link));
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const handleLinkHover = (link) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();
    if (link) {
      newHighlightLinks.add(link);
      newHighlightNodes.add(link.source);
      newHighlightNodes.add(link.target);
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const label = node.name;
      const fontSize = 14 / globalScale;
      const fontFamily = 'Outfit'; // Use the Google Font here
      ctx.font = `${fontSize}px ${fontFamily}`;
      const nodeDiameter = 50;
      const nodeRadius = nodeDiameter / 2;
      node.r = nodeRadius;

      // Determine color based on node type and group
      let fillColor = '#1A1A1A'; // Node background
      let borderColor = '#00A3FF'; // Default border color

      if (node.type === 'user') {
        if (node.group === 'currentUser') {
          borderColor = '#00A3FF'; // Bright blue
        } else {
          borderColor = '#007ACC'; // Medium blue
        }
      } else if (node.type === 'project') {
        if (node.createdById === myUserId) {
          borderColor = '#00FFC8'; // Bright teal
        } else {
          borderColor = '#009688'; // Darker teal
        }
      } else if (node.type === 'research') {
        borderColor = '#FF5733'; // Distinct color for research papers
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
    return (
      <div className={styles.loadingContainer}>
        <CleanOrbitingRingLoader size={150} />
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.graphContainer}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
        nodeRelSize={20}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)}
        linkColor={() => 'rgba(0, 163, 255, 0.2)'}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => '#00A3FF'}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        onNodeClick={handleNodeClick}
        backgroundColor="#121212"
        cooldownTicks={50}
      />
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Knowledge Graph</h1>
        <p className={styles.headerDescription}>
          Connections between your work and others.
        </p>
      </div>
      {selectedNode && (
        <div className={styles.alert}>
          <div className={styles.alertIcon}>ℹ️</div>
          <div className={styles.alertContent}>
            <h4 className={styles.alertTitle}>
              {selectedNode.type === 'user'
                ? 'Selected User'
                : selectedNode.type === 'project'
                ? 'Selected Project'
                : 'Selected Research Paper'}
            </h4>
            <p className={styles.alertDescription}>
              {selectedNode.type === 'user' ? (
                <>
                  {selectedNode.name} ({selectedNode.user_type})
                  <br />
                  Email: {selectedNode.email}
                  <br />
                  Skills:{' '}
                  {selectedNode.skills && selectedNode.skills.length > 0
                    ? selectedNode.skills.join(', ')
                    : 'N/A'}
                  <br />
                  Interests:{' '}
                  {selectedNode.interests && selectedNode.interests.length > 0
                    ? selectedNode.interests.join(', ')
                    : 'N/A'}
                </>
              ) : selectedNode.type === 'project' ? (
                <>
                  Project: {selectedNode.name}
                  <br />
                  Created By: {selectedNode.createdBy}
                  <br />
                  Tags:{' '}
                  {selectedNode.tags && selectedNode.tags.length > 0
                    ? selectedNode.tags.join(', ')
                    : 'N/A'}
                </>
              ) : (
                <>
                  Title: {selectedNode.name}
                  <br />
                  arXiv ID: {selectedNode.arxiv_id}
                  <br />
                  Mongo ID: {selectedNode.mongo_id}
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

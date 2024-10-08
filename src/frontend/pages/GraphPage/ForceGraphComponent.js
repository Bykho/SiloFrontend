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
        const [usersResponse, projectsResponse] = await Promise.all([
          fetch(`${config.apiBaseUrl}/userFilteredSearch/all`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${config.apiBaseUrl}/projectFilteredSearch/all`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        if (!usersResponse.ok || !projectsResponse.ok) {
          throw new Error('Failed to fetch users or projects');
        }

        const usersData = await usersResponse.json();
        const projectsData = await projectsResponse.json();

        // Initialize graph data
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // Helper function to add a node if it doesn't exist
        const addNode = (node) => {
          if (!nodeMap.has(node.id)) {
            nodeMap.set(node.id, node);
            nodes.push(node);
          }
        };

        // Helper function to add a link if it doesn't exist
        const linkSet = new Set();
        const addLink = (link) => {
          const linkKey = `${link.source}-${link.target}-${link.type}`;
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);
            links.push(link);
          }
        };

        // Build inverted indices for skills/interests and tags
        const keywordToUsers = new Map();
        usersData.forEach((u) => {
          const keywords = [...(u.skills || []), ...(u.interests || [])];
          keywords.forEach((keyword) => {
            if (!keywordToUsers.has(keyword)) {
              keywordToUsers.set(keyword, new Set());
            }
            keywordToUsers.get(keyword).add(u);
          });
        });

        const keywordToProjects = new Map();
        projectsData.forEach((p) => {
          const tags = p.tags || [];
          tags.forEach((tag) => {
            if (!keywordToProjects.has(tag)) {
              keywordToProjects.set(tag, new Set());
            }
            keywordToProjects.get(tag).add(p);
          });
        });

        // Start building the graph from the current user
        const currentUser = usersData.find((u) => u._id === myUserId);
        if (!currentUser) {
          throw new Error('Current user not found in users data');
        }

        // Add the current user node
        const currentUserNode = {
          id: currentUser._id,
          name: currentUser.username,
          type: 'user',
          group: 'currentUser',
          skills: currentUser.skills || [],
          interests: currentUser.interests || [],
          user_type: currentUser.user_type,
          email: currentUser.email,
        };
        addNode(currentUserNode);

        // BFS setup
        const maxDepth = 2; // Limit the depth to control graph size
        const queue = [{ node: currentUserNode, depth: 0 }];
        const visitedNodes = new Set([currentUserNode.id]);

        while (queue.length > 0) {
          const { node, depth } = queue.shift();

          if (depth >= maxDepth) continue;

          if (node.type === 'user') {
            // Add user's projects
            const userProjects = projectsData.filter(
              (p) => p.user_id === node.id
            );

            userProjects.forEach((project) => {
              const projectNode = {
                id: project._id,
                name: project.projectName,
                type: 'project',
                tags: project.tags || [],
                createdBy: project.createdBy,
                createdById: project.user_id,
              };
              addNode(projectNode);
              addLink({
                source: node.id,
                target: projectNode.id,
                type: 'user-project',
              });

              if (!visitedNodes.has(projectNode.id)) {
                visitedNodes.add(projectNode.id);
                queue.push({ node: projectNode, depth: depth + 1 });
              }
            });

            // Add connections to other users via shared skills/interests
            const keywords = [...(node.skills || []), ...(node.interests || [])];
            keywords.forEach((keyword) => {
              const relatedUsers = keywordToUsers.get(keyword) || [];
              relatedUsers.forEach((relatedUser) => {
                if (relatedUser._id !== node.id) {
                  const relatedUserNode = {
                    id: relatedUser._id,
                    name: relatedUser.username,
                    type: 'user',
                    group: 'otherUser',
                    skills: relatedUser.skills || [],
                    interests: relatedUser.interests || [],
                    user_type: relatedUser.user_type,
                    email: relatedUser.email,
                  };
                  addNode(relatedUserNode);
                  addLink({
                    source: node.id,
                    target: relatedUserNode.id,
                    type: 'user-user',
                    keyword,
                  });

                  if (!visitedNodes.has(relatedUserNode.id)) {
                    visitedNodes.add(relatedUserNode.id);
                    queue.push({ node: relatedUserNode, depth: depth + 1 });
                  }
                }
              });

              // Connect to projects with matching tags
              const relatedProjects = keywordToProjects.get(keyword) || [];
              relatedProjects.forEach((relatedProject) => {
                if (relatedProject.user_id !== node.id) {
                  const relatedProjectNode = {
                    id: relatedProject._id,
                    name: relatedProject.projectName,
                    type: 'project',
                    tags: relatedProject.tags || [],
                    createdBy: relatedProject.createdBy,
                    createdById: relatedProject.user_id,
                  };
                  addNode(relatedProjectNode);
                  addLink({
                    source: node.id,
                    target: relatedProjectNode.id,
                    type: 'user-project',
                    keyword,
                  });

                  if (!visitedNodes.has(relatedProjectNode.id)) {
                    visitedNodes.add(relatedProjectNode.id);
                    queue.push({ node: relatedProjectNode, depth: depth + 1 });
                  }
                }
              });
            });
          } else if (node.type === 'project') {
            // Add project's creator
            const creator = usersData.find((u) => u._id === node.createdById);
            if (creator && creator._id !== currentUserNode.id) {
              const creatorNode = {
                id: creator._id,
                name: creator.username,
                type: 'user',
                group: 'otherUser',
                skills: creator.skills || [],
                interests: creator.interests || [],
                user_type: creator.user_type,
                email: creator.email,
              };
              addNode(creatorNode);
              addLink({
                source: node.id,
                target: creatorNode.id,
                type: 'project-owner',
              });

              if (!visitedNodes.has(creatorNode.id)) {
                visitedNodes.add(creatorNode.id);
                queue.push({ node: creatorNode, depth: depth + 1 });
              }
            }

            // Connect to other projects via shared tags
            const tags = node.tags || [];
            tags.forEach((tag) => {
              const relatedProjects = keywordToProjects.get(tag) || [];
              relatedProjects.forEach((relatedProject) => {
                if (relatedProject._id !== node.id) {
                  const relatedProjectNode = {
                    id: relatedProject._id,
                    name: relatedProject.projectName,
                    type: 'project',
                    tags: relatedProject.tags || [],
                    createdBy: relatedProject.createdBy,
                    createdById: relatedProject.user_id,
                  };
                  addNode(relatedProjectNode);
                  addLink({
                    source: node.id,
                    target: relatedProjectNode.id,
                    type: 'project-project',
                    keyword: tag,
                  });

                  if (!visitedNodes.has(relatedProjectNode.id)) {
                    visitedNodes.add(relatedProjectNode.id);
                    queue.push({ node: relatedProjectNode, depth: depth + 1 });
                  }
                }
              });
            });
          }
        }

        setGraphData({ nodes, links });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch graph data');
        setLoading(false);
      }
    };
    fetchGraphData();
  }, [myUsername, mySkills, myInterests, myUserId]);

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
      const nodeDiameter = 50; // Fixed size
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

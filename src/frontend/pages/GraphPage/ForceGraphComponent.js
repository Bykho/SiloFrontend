import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3-force';
import styles from './ForceGraphComponent.module.css';
import config from '../../config';
import { useUser } from '../../contexts/UserContext';
import CleanOrbitingRingLoader from '../../components/FractalLoadingBar';
import {
  FaBars,
  FaTimes,
  FaChevronLeft,
} from 'react-icons/fa';

const ForceGraphComponent = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true); // State to control sidebar visibility
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
      fg.d3Force('charge').strength(-500);
      fg.d3Force('link').distance(170);
      fg.d3Force('collide', d3.forceCollide(80).strength(0.9));
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
          depth: 0,
          childrenFetched: false,
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
            depth: 1,
            childrenFetched: false,
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
              depth: 2,
              childrenFetched: false,
            };
            nodes.push(projectNode);
            nodeMap.set(project._id, projectNode);
          }
        });

        // Add similar research papers
        similarResearchPapers.forEach(paper => {
          if (!nodeMap.has(paper._id)) {
            const paperNode = {
              id: paper._id,
              name: paper.title,
              type: 'research',
              arxiv_id: paper.arxiv_id,
              mongo_id: paper._id,
              depth: 2,
              childrenFetched: false,
            };
            nodes.push(paperNode);
            nodeMap.set(paper._id, paperNode);
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
              depth: 3,
              childrenFetched: false,
            };
            nodes.push(authorNode);
            nodeMap.set(author._id, authorNode);
          }
        });

        // Build links between user's projects and similar projects/research papers
        for (const userProjectId of userProjectIds) {
          const similarProjectIdsForUserProject = similarProjectsMap[userProjectId] || [];
          const similarResearchPaperIdsForUserProject = similarResearchPapersMap[userProjectId] || [];

          // Limit to top 8 combined similar items
          const combinedSimilarIds = [
            ...similarProjectIdsForUserProject.map(id => ({ id, type: 'project' })),
            ...similarResearchPaperIdsForUserProject.map(id => ({ id, type: 'research' })),
          ].slice(0, 8);

          combinedSimilarIds.forEach(item => {
            links.push({
              source: userProjectId,
              target: item.id,
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

        // Assign neighbors and links to nodes
        nodes.forEach(node => {
          node.neighbors = [];
          node.links = [];
        });

        links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;

          const sourceNode = nodeMap.get(sourceId);
          const targetNode = nodeMap.get(targetId);

          if (sourceNode && targetNode) {
            sourceNode.neighbors.push(targetNode);
            sourceNode.links.push(link);
            targetNode.neighbors.push(sourceNode);
            targetNode.links.push(link);
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

  const handleNodeClick = useCallback(
    async (node) => {
      setSelectedNode(node);
      console.log('Selected node:', node);
      // Only proceed if node is an edge node and hasn't reached depth limit
      if (node.childrenFetched || node.depth >= 25) {
        return;
      }

      // Check if node is an edge node (has only one link)
      if (node.links.length > 1) {
        return;
      }

      if (node.type === 'project' || node.type === 'research') {
        const token = localStorage.getItem('token');
        
        try {
          const projectId = node.id;

          // Fetch similar projects
          const similarProjectsResponse = await fetch(
            `${config.apiBaseUrl}/getSimilarProjectsBatch`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ projectIds: [projectId] }),
            }
          );

          if (!similarProjectsResponse.ok) {
            throw new Error('Failed to fetch similar projects');
          }

          const similarProjectsMap = await similarProjectsResponse.json();
          const similarProjectIds = similarProjectsMap[projectId] || [];

          // Fetch similar research papers
          const similarResearchPapersResponse = await fetch(
            `${config.apiBaseUrl}/getSimilarResearchPapersBatch`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ projectIds: [projectId] }),
            }
          );

          if (!similarResearchPapersResponse.ok) {
            throw new Error('Failed to fetch similar research papers');
          }

          const similarResearchPapersMap = await similarResearchPapersResponse.json();
          const similarResearchPaperIds = similarResearchPapersMap[projectId] || [];

          // Fetch details of similar projects
          const similarProjectsDetailsResponse = await fetch(
            `${config.apiBaseUrl}/returnProjectsFromIds`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ projectIds: similarProjectIds }),
            }
          );

          if (!similarProjectsDetailsResponse.ok) {
            throw new Error('Failed to fetch similar project details');
          }

          const similarProjects = await similarProjectsDetailsResponse.json();
          console.log('Similar projects:', similarProjects);
          // Fetch details of similar research papers
          const similarResearchPapersDetailsResponse = await fetch(
            `${config.apiBaseUrl}/returnResearchPapersFromIds`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ researchPaperIds: similarResearchPaperIds }),
            }
          );

          if (!similarResearchPapersDetailsResponse.ok) {
            throw new Error('Failed to fetch similar research paper details');
          }

          const similarResearchPapers = await similarResearchPapersDetailsResponse.json();
          console.log('Similar research papers:', similarResearchPapers);
          // Build nodes and links for the new data
          const newNodes = [];
          const newLinks = [];
          const nodeMap = new Map();
          graphData.nodes.forEach((n) => nodeMap.set(n.id, n));

          // For similar projects
          similarProjects.forEach((project) => {
            if (!nodeMap.has(project._id)) {
              const projectNode = {
                id: project._id,
                name: project.projectName,
                type: 'project',
                createdBy: project.createdBy,
                createdById: project.user_id,
                tags: project.tags || [],
                depth: node.depth + 1,
                childrenFetched: false,
              };
              newNodes.push(projectNode);
              nodeMap.set(project._id, projectNode);
            }
            // Add link from the clicked node to similar project
            newLinks.push({
              source: node.id,
              target: project._id,
              type: 'project-project',
            });
          });

          // For similar research papers
          similarResearchPapers.forEach((paper) => {
            if (!nodeMap.has(paper._id)) {
              const paperNode = {
                id: paper._id,
                name: paper.title,
                type: 'research',
                arxiv_id: paper.arxiv_id,
                mongo_id: paper._id,
                depth: node.depth + 1,
                childrenFetched: false,
              };
              newNodes.push(paperNode);
              nodeMap.set(paper._id, paperNode);
            }
            // Add link from the clicked node to similar research paper
            newLinks.push({
              source: node.id,
              target: paper._id,
              type: 'project-research',
            });
          });

          // Fetch authors of similar projects
          const authorIdsSet = new Set();
          similarProjects.forEach((project) => {
            if (project.user_id) {
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

          // Add authors to nodes
          authors.forEach((author) => {
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
                depth: node.depth + 2,
                childrenFetched: false,
              };
              newNodes.push(authorNode);
              nodeMap.set(author._id, authorNode);
            }
          });

          // Link similar projects to their authors
          similarProjects.forEach((project) => {
            if (project.user_id) {
              newLinks.push({
                source: project._id,
                target: project.user_id,
                type: 'project-owner',
              });
            }
          });

          // Assign neighbors and links to new nodes
          newNodes.forEach((newNode) => {
            newNode.neighbors = [];
            newNode.links = [];
          });

          // Update graphData nodes and links
          const updatedNodes = [...graphData.nodes, ...newNodes];
          const updatedLinks = [...graphData.links, ...newLinks];

          // Update nodeMap with new nodes
          updatedNodes.forEach((n) => nodeMap.set(n.id, n));

          // Reassign neighbors and links
          updatedLinks.forEach((link) => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            const sourceNode = nodeMap.get(sourceId);
            const targetNode = nodeMap.get(targetId);

            if (sourceNode && targetNode) {
              if (!sourceNode.neighbors.includes(targetNode)) {
                sourceNode.neighbors.push(targetNode);
              }
              if (!sourceNode.links.includes(link)) {
                sourceNode.links.push(link);
              }
              if (!targetNode.neighbors.includes(sourceNode)) {
                targetNode.neighbors.push(sourceNode);
              }
              if (!targetNode.links.includes(link)) {
                targetNode.links.push(link);
              }
            }
          });

          setGraphData({ nodes: updatedNodes, links: updatedLinks });

          // Mark node as expanded
          node.childrenFetched = true;
        } catch (error) {
          console.error('Error expanding node:', error);
        }
      }
    },
    [graphData, myUserId]
  );

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const label = node.type === 'user' ? node.name : (node.name.length > 35 ? node.name.substring(0, 32) + '...' : node.name);
      const fontSize = 14 / globalScale;
      const fontFamily = 'Outfit'; // Use the Google Font here
      ctx.font = `${fontSize}px ${fontFamily}`;
      const nodeDiameter = 70;
      const nodeRadius = nodeDiameter / 2;
      node.r = nodeRadius;

      // Determine color based on node type and group
      let fillColor = '#1A1A1A'; // Node background
      let borderColor = '#00A3FF'; // Default border color

      if (node.type === 'user') {
        if (node.group === 'currentUser') {
          borderColor = '#00A3FF'; // Bright cyan (brighter)
        } else {
          borderColor = '#3366FF'; // Darker blue
        }
      } else if (node.type === 'project') {
        if (node.createdById === myUserId) {
          borderColor = '#00FFFF'; // Cyan
        } else {
          borderColor = '#0066CC'; // Darker medium blue
        }
      } else if (node.type === 'research') {
        borderColor = '#8A2BE2'; // Masculine purple
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
      ctx.fillStyle = '#cdd0d4';
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
      {/* Graph Area */}
      <div
        className={styles.graphArea}
        style={{ width: showSidebar ? '70%' : '100%' }}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
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
        {/* Toggle Sidebar Button */}
        {!showSidebar && (
          <button
            className={styles.sidebarToggleButton}
            onClick={() => setShowSidebar(true)}
          >
            <FaChevronLeft />
          </button>
        )}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Knowledge Graph</h1>
          <p className={styles.headerDescription}>
            Connections between your work and others.
          </p>
        </div>
      </div>
      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${
          showSidebar ? styles.sidebarVisible : styles.sidebarHidden
        }`}
      >
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search..." />
        </div>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSwitch}></span>
            Papers
          </label>
          <label className={styles.toggleLabel}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSwitch}></span>
            Projects
          </label>
          <label className={styles.toggleLabel}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSwitch}></span>
            People
          </label>
          <button
            onClick={() => setShowSidebar(false)}
            className={styles.closeSidebarButton}
          >
            <FaTimes />
          </button>
        </div>
        {/* Node Information Section */}
        <div className={styles.nodeInfo}>
          {selectedNode ? (
            <div>
              <h2>{selectedNode.name}</h2>
              <p>Type: {selectedNode.type}</p>
              {/* Display other details based on type */}
              {selectedNode.type === 'user' && (
                <>
                  <p>Email: {selectedNode.email}</p>
                  <p>User Type: {selectedNode.user_type}</p>
                  <p>
                    Skills:{' '}
                    {selectedNode.skills && selectedNode.skills.length > 0
                      ? selectedNode.skills.join(', ')
                      : 'N/A'}
                  </p>
                  <p>
                    Interests:{' '}
                    {selectedNode.interests && selectedNode.interests.length > 0
                      ? selectedNode.interests.join(', ')
                      : 'N/A'}
                  </p>
                </>
              )}
              {selectedNode.type === 'project' && (
                <>
                  <p>Created By: {selectedNode.createdBy}</p>
                  <p>
                    Tags:{' '}
                    {selectedNode.tags && selectedNode.tags.length > 0
                      ? selectedNode.tags.join(', ')
                      : 'N/A'}
                  </p>
                </>
              )}
              {selectedNode.type === 'research' && (
                <>
                  <p>arXiv ID: {selectedNode.arxiv_id}</p>
                  <p>Mongo ID: {selectedNode.mongo_id}</p>
                </>
              )}
              {/* Child nodes as nested, clickable list */}
              {selectedNode.neighbors && selectedNode.neighbors.length > 0 && (
                <div>
                  <h3>Connected Nodes:</h3>
                  <ul className={styles.nodeList}>
                    {selectedNode.neighbors.map((neighbor) => (
                      <li
                        key={neighbor.id}
                        onClick={() => {
                          setSelectedNode(neighbor);
                          fgRef.current.centerAt(neighbor.x, neighbor.y, 1000);
                        }}
                      >
                        {neighbor.name} ({neighbor.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2>{myUsername}</h2>
              <p>Email: {myEmail}</p>
              <p>User Type: {myUserType}</p>
              <p>
                Skills: {mySkills && mySkills.length > 0 ? mySkills.join(', ') : 'N/A'}
              </p>
              <p>
                Interests:{' '}
                {myInterests && myInterests.length > 0 ? myInterests.join(', ') : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForceGraphComponent;
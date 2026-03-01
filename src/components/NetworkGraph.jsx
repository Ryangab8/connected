import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNodes, getEdges, getEcosystemClusters } from '../lib/dataLoader';
import SpeciesImage from './SpeciesImage';

function NetworkGraph({ relationshipFilter = 'all' }) {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const popupRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState(-1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const navigate = useNavigate();

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Track window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 130 // Minus header (70px) and relationship filter (60px)
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize nodes and edges
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const nodes = getNodes();
    const edges = getEdges();

    // Scale node positions to canvas dimensions
    nodesRef.current = nodes.map(n => ({
      ...n,
      x: n.fixedX * dimensions.width,
      y: n.fixedY * dimensions.height
    }));

    edgesRef.current = edges;
  }, [dimensions]);

  // Draw network
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Apply transform
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Determine which nodes/edges to highlight
    let connectedNodeIds = new Set();
    let highlightedEdges = new Set();

    if (selectedNode !== null) {
      connectedNodeIds.add(selectedNode);
      edges.forEach(edge => {
        if (edge.source === selectedNode) {
          connectedNodeIds.add(edge.target);
          highlightedEdges.add(edge.id);
        }
        if (edge.target === selectedNode) {
          connectedNodeIds.add(edge.source);
          highlightedEdges.add(edge.id);
        }
      });
    }

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      // Determine if edge should be visible/highlighted
      const isHighlighted = selectedNode !== null && highlightedEdges.has(edge.id);
      const matchesRelFilter = relationshipFilter === 'all' || edge.type === relationshipFilter;
      const shouldDim = (selectedNode !== null && !isHighlighted) ||
                       (relationshipFilter !== 'all' && !matchesRelFilter);

      // Skip edges that don't match the relationship filter
      if (relationshipFilter !== 'all' && !matchesRelFilter) return;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);

      // Color edges only when:
      // 1. A relationship filter is active, OR
      // 2. A node is selected and this is one of its edges
      const shouldUseColor = (relationshipFilter !== 'all' && matchesRelFilter) ||
                              (selectedNode !== null && isHighlighted);

      if (shouldUseColor) {
        // Colored edges when filtered or selected
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.8;
      } else if (shouldDim) {
        // Dimmed edges
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.05;
      } else {
        // Default state: subtle grey
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const isHovered = i === hoveredNode;
      const isSelected = node.id === selectedNode;
      const isConnected = connectedNodeIds.has(node.id);
      const shouldDim = (selectedNode !== null && !isConnected);

      // Glow effect for hover/selection
      if (isHovered || isSelected) {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius + 16);
        gradient.addColorStop(0, node.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main node circle - just ecosystem color, no status ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = shouldDim ? node.color + '60' : node.color;
      ctx.fill();

      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

    });

    // Draw labels with collision detection (against both labels AND nodes)
    const labelBounds = [];

    nodes.forEach((node, i) => {
      const isHovered = i === hoveredNode;
      const isSelected = node.id === selectedNode;
      const isConnected = connectedNodeIds.has(node.id);
      const shouldDim = (selectedNode !== null && !isConnected);

      ctx.font = (isSelected || isHovered ? '600 ' : '400 ') + '11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = shouldDim ? '#9ca3af' : '#2d3436';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Wrap long names
      const name = node.commonName;
      const maxWidth = 80;
      const words = name.split(' ');
      const lines = [];
      let line = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const labelHeight = lines.length * 13;

      // Try different positions: below, above, right, left
      const positions = [
        { x: node.x - maxWidth / 2, y: node.y + node.radius + 8, align: 'center' }, // below
        { x: node.x - maxWidth / 2, y: node.y - node.radius - labelHeight - 8, align: 'center' }, // above
        { x: node.x + node.radius + 8, y: node.y - labelHeight / 2, align: 'left' }, // right
        { x: node.x - node.radius - maxWidth - 8, y: node.y - labelHeight / 2, align: 'right' } // left
      ];

      let finalPosition = positions[0];
      let collision = true;

      for (const pos of positions) {
        collision = false;
        const bounds = {
          x: pos.x,
          y: pos.y,
          width: maxWidth,
          height: labelHeight
        };

        // Check collision with existing labels
        for (const existing of labelBounds) {
          if (bounds.x < existing.x + existing.width &&
              bounds.x + bounds.width > existing.x &&
              bounds.y < existing.y + existing.height &&
              bounds.y + bounds.height > existing.y) {
            collision = true;
            break;
          }
        }

        // Check collision with ALL nodes
        if (!collision) {
          for (const otherNode of nodes) {
            const dx = otherNode.x - (bounds.x + bounds.width / 2);
            const dy = otherNode.y - (bounds.y + bounds.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < otherNode.radius + 15) {
              collision = true;
              break;
            }
          }
        }

        if (!collision) {
          finalPosition = pos;
          labelBounds.push(bounds);
          break;
        }
      }

      // If still collision, use default below position with offset
      if (collision) {
        let offset = 0;
        const maxOffset = 60;
        while (collision && offset < maxOffset) {
          collision = false;
          const bounds = {
            x: node.x - maxWidth / 2,
            y: node.y + node.radius + 8 + offset,
            width: maxWidth,
            height: labelHeight
          };

          for (const existing of labelBounds) {
            if (bounds.x < existing.x + existing.width &&
                bounds.x + bounds.width > existing.x &&
                bounds.y < existing.y + existing.height &&
                bounds.y + bounds.height > existing.y) {
              collision = true;
              offset += 8;
              break;
            }
          }

          if (!collision) {
            finalPosition = { x: bounds.x, y: bounds.y, align: 'center' };
            labelBounds.push(bounds);
            break;
          }
        }
      }

      // Draw label lines
      ctx.textAlign = finalPosition.align || 'center';
      const labelX = finalPosition.align === 'left' ? finalPosition.x :
                     finalPosition.align === 'right' ? finalPosition.x + maxWidth :
                     node.x;

      lines.forEach((text, idx) => {
        ctx.fillText(text, labelX, finalPosition.y + idx * 13);
      });
    });

    // Draw ecosystem cluster labels (positioned above/outside clusters)
    const clusters = getEcosystemClusters();
    clusters.forEach(cluster => {
      const x = cluster.x * dimensions.width;
      const y = cluster.y * dimensions.height;

      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = cluster.color + '50'; // Semi-transparent ecosystem color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cluster.label, x, y);
    });

    // Restore canvas context
    ctx.restore();

  }, [dimensions, hoveredNode, selectedNode, relationshipFilter, transform]);

  // Helper: transform screen coordinates to canvas space
  const screenToCanvas = (screenX, screenY) => {
    const canvasX = (screenX - transform.x) / transform.scale;
    const canvasY = (screenY - transform.y) / transform.scale;
    return { x: canvasX, y: canvasY };
  };

  // Mouse move handler (with panning support)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Handle panning
      if (isDraggingRef.current) {
        const dx = screenX - lastMousePosRef.current.x;
        const dy = screenY - lastMousePosRef.current.y;
        setTransform(prev => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy
        }));
        lastMousePosRef.current = { x: screenX, y: screenY };
        canvas.style.cursor = 'grabbing';
        return;
      }

      // Transform to canvas space for hit testing
      const { x: mx, y: my } = screenToCanvas(screenX, screenY);

      let found = -1;
      nodesRef.current.forEach((node, i) => {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 4) {
          found = i;
        }
      });

      setHoveredNode(found);
      canvas.style.cursor = found >= 0 ? 'pointer' : 'grab';

      // Update tooltip
      if (found >= 0 && tooltipRef.current) {
        const node = nodesRef.current[found];
        tooltipRef.current.style.opacity = '1';
        tooltipRef.current.style.left = `${e.clientX + 12}px`;
        tooltipRef.current.style.top = `${e.clientY - 12}px`;
        tooltipRef.current.innerHTML = `
          <div style="font-family: Georgia, serif; font-weight: 600; margin-bottom: 0.25rem; color: #2d3436;">
            ${node.commonName}
          </div>
          <div style="font-size: 0.75rem; color: #636e72; font-style: italic; margin-bottom: 0.5rem;">
            ${node.scientificName}
          </div>
          ${node.tagline ? `<div style="font-size: 0.75rem; color: #2d6a4f; margin-bottom: 0.5rem;">${node.tagline}</div>` : ''}
          <div style="font-size: 0.7rem; color: #2d6a4f; cursor: pointer;">
            View full profile →
          </div>
        `;
      } else if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      if (hoveredNode === -1) {
        // Start panning if not on a node
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: screenX, y: screenY };
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e) => {
      // Only trigger click if we weren't dragging
      if (hoveredNode >= 0) {
        const node = nodesRef.current[hoveredNode];
        setSelectedNode(node.id);
        setPopupVisible(true);
        // Store node position, not screen position, so popup moves with canvas
        setPopupPosition({ nodeX: node.x, nodeY: node.y });
      } else {
        // Only deselect if clicking empty space (not during drag)
        setSelectedNode(null);
        setPopupVisible(false);
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom towards mouse position (min 1.0 = default view, max 3.0)
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(1.0, Math.min(3, transform.scale * zoomFactor));

      // Adjust pan to zoom towards mouse
      const scaleDiff = newScale - transform.scale;
      const newX = transform.x - (mouseX - transform.x) * (scaleDiff / transform.scale);
      const newY = transform.y - (mouseY - transform.y) * (scaleDiff / transform.scale);

      setTransform({
        x: newX,
        y: newY,
        scale: newScale
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [hoveredNode, navigate, transform]);

  // Reset zoom and pan to default
  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setSelectedNode(null);
    setPopupVisible(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '130px',
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'visible'
    }}>
      {/* Fit to Screen Button */}
      <button
        onClick={handleResetView}
        style={{
          position: 'fixed',
          top: '140px',
          left: '20px',
          zIndex: 100,
          padding: '0.5rem 0.75rem',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#636e72',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f8f7f4';
          e.currentTarget.style.borderColor = '#2d6a4f';
          e.currentTarget.style.color = '#2d6a4f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.color = '#636e72';
        }}
      >
        ⊙ Fit to Screen
      </button>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          display: 'block',
          background: '#f8f7f4'
        }}
      />

      {/* Hover Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          pointerEvents: 'none',
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Selection Popup */}
      {popupVisible && selectedNode !== null && (() => {
        const node = nodesRef.current.find(n => n.id === selectedNode);
        if (!node) return null;

        // Count connections
        const connections = edgesRef.current.filter(e =>
          e.source === selectedNode || e.target === selectedNode
        ).length;

        // Calculate smart popup position based on connection quadrants
        const connectedNodes = [];
        edgesRef.current.forEach(edge => {
          if (edge.source === selectedNode) {
            const targetNode = nodesRef.current.find(n => n.id === edge.target);
            if (targetNode) connectedNodes.push(targetNode);
          }
          if (edge.target === selectedNode) {
            const sourceNode = nodesRef.current.find(n => n.id === edge.source);
            if (sourceNode) connectedNodes.push(sourceNode);
          }
        });

        // Count connections per quadrant relative to selected node
        const quadrants = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
        connectedNodes.forEach(connNode => {
          const dx = connNode.x - node.x;
          const dy = connNode.y - node.y;
          if (dx < 0 && dy < 0) quadrants.topLeft++;
          else if (dx >= 0 && dy < 0) quadrants.topRight++;
          else if (dx < 0 && dy >= 0) quadrants.bottomLeft++;
          else quadrants.bottomRight++;
        });

        // Find quadrant with fewest connections
        let minQuadrant = 'bottomRight';
        let minCount = quadrants.bottomRight;
        Object.entries(quadrants).forEach(([quad, count]) => {
          if (count < minCount) {
            minCount = count;
            minQuadrant = quad;
          }
        });

        // Calculate popup offset based on best quadrant
        let offsetX = 20;
        let offsetY = 20;
        if (minQuadrant === 'topLeft') { offsetX = -340; offsetY = -220; }
        else if (minQuadrant === 'topRight') { offsetX = 20; offsetY = -220; }
        else if (minQuadrant === 'bottomLeft') { offsetX = -340; offsetY = 20; }
        else { offsetX = 20; offsetY = 20; }

        // Transform node position to screen coordinates
        const screenX = popupPosition.nodeX * transform.scale + transform.x;
        const screenY = popupPosition.nodeY * transform.scale + transform.y;

        return (
          <div
            ref={popupRef}
            style={{
              position: 'fixed',
              left: `${screenX + offsetX}px`,
              top: `${screenY + offsetY}px`,
              background: '#ffffff',
              border: '2px solid #2d6a4f',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '320px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 2000,
              pointerEvents: 'auto'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <SpeciesImage speciesId={node.id} size="tooltip" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', color: '#2d3436' }}>
                  {node.commonName}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#636e72', fontStyle: 'italic' }}>
                  {node.scientificName}
                </div>
              </div>
            </div>
            {node.tagline && (
              <div style={{ fontSize: '0.875rem', color: '#2d6a4f', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {node.tagline}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
              <div style={{
                padding: '0.25rem 0.75rem',
                background: `${node.statusColor}20`,
                border: `1px solid ${node.statusColor}`,
                borderRadius: '6px',
                color: node.statusColor,
                fontWeight: 500,
                textTransform: 'capitalize'
              }}>
                {node.status}
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                background: '#f8f7f4',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#636e72',
                textTransform: 'capitalize'
              }}>
                {connections} {connections === 1 ? 'connection' : 'connections'}
              </div>
            </div>
            <div
              onClick={() => {
                setPopupVisible(false);
                navigate(`/species/${node.id}`);
              }}
              style={{
                fontSize: '0.875rem',
                color: '#ffffff',
                background: '#2d6a4f',
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                textAlign: 'center',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#235a42'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2d6a4f'}
            >
              View full profile →
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default NetworkGraph;

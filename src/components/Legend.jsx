import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Legend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const conservationStatuses = [
    { label: 'Declining', color: '#e74c3c' },
    { label: 'Vulnerable', color: '#f39c12' },
    { label: 'Stable', color: '#27ae60' },
    { label: 'Invasive', color: '#9b59b6' }
  ];

  const relationshipTypes = [
    { label: 'Predator-Prey', color: '#e74c3c' },
    { label: 'Competition', color: '#f39c12' },
    { label: 'Habitat', color: '#3498db' },
    { label: 'Pollination', color: '#e91e63' },
    { label: 'Seed Dispersal', color: '#8e44ad' },
    { label: 'Positive Effect', color: '#27ae60' },
    { label: 'Herbivory', color: '#d35400' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        background: 'rgba(20, 20, 20, 0.9)',
        border: '1px solid #2a2a2a',
        borderRadius: '8px',
        padding: isExpanded ? '1.5rem' : '1rem',
        backdropFilter: 'blur(10px)',
        minWidth: isExpanded ? '280px' : 'auto',
        transition: 'all 0.3s ease',
        zIndex: 10
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Legend
        </h4>
        <span style={{ fontSize: '1.25rem', marginLeft: '1rem' }}>
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ marginTop: '1.5rem' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
              Conservation Status
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {conservationStatuses.map(status => (
                <div key={status.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.color,
                      border: '1px solid #fff',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#e8e8e8' }}>
                    {status.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
              Relationships
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relationshipTypes.map(type => (
                <div key={type.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '2px',
                      backgroundColor: type.color,
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#e8e8e8' }}>
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2a2a2a' }}>
            <p style={{ fontSize: '0.75rem', color: '#6a6a6a', margin: 0, lineHeight: 1.4 }}>
              Click a node to explore connections. Drag to reposition. Scroll to zoom.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Legend;

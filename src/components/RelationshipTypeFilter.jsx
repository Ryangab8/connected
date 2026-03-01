import React from 'react';
import { motion } from 'framer-motion';
import { getRelationshipColor } from '../lib/dataLoader';

function RelationshipTypeFilter({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'predator_prey', label: 'Predator/Prey' },
    { id: 'habitat_provider', label: 'Habitat' },
    { id: 'pollination', label: 'Pollination' },
    { id: 'competition', label: 'Competition' },
    { id: 'seed_dispersal', label: 'Dispersal' },
    { id: 'soil_engineering', label: 'Soil Eng.' },
    { id: 'nutrient_cycling', label: 'Nutrients' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      zIndex: 90,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.6rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto'
        }}
      >
      {filters.map(filter => {
        const isActive = activeFilter === filter.id;
        const color = filter.id === 'all' ? '#2d6a4f' : getRelationshipColor(filter.id);

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            style={{
              padding: '0.4rem 0.75rem',
              border: isActive ? '2px solid #2d6a4f' : '1px solid #e5e7eb',
              background: isActive
                ? 'rgba(45, 106, 79, 0.1)'
                : '#ffffff',
              color: isActive ? '#2d6a4f' : '#636e72',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              letterSpacing: '0.01em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: isActive ? '0 1px 3px rgba(45, 106, 79, 0.1)' : 'none',
              outline: 'none',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            {filter.id !== 'all' && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0
                }}
              />
            )}
            {filter.label}
          </button>
        );
      })}
      </motion.div>
    </div>
  );
}

export default RelationshipTypeFilter;

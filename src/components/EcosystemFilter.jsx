import React from 'react';
import { motion } from 'framer-motion';
import { getEcosystemInfo } from '../lib/dataLoader';

function EcosystemFilter({ activeFilter = 'all', onFilterChange }) {
  const ecosystems = getEcosystemInfo();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {ecosystems.map(ecosystem => (
        <button
          key={ecosystem.id}
          onClick={() => onFilterChange(ecosystem.id)}
          style={{
            padding: '0.5rem 1rem',
            border: activeFilter === ecosystem.id ? '2px solid #2d6a4f' : '1px solid #e5e7eb',
            background: activeFilter === ecosystem.id
              ? 'rgba(45, 106, 79, 0.1)'
              : '#ffffff',
            color: activeFilter === ecosystem.id ? '#2d6a4f' : '#636e72',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeFilter === ecosystem.id ? '0 1px 3px rgba(45, 106, 79, 0.1)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeFilter !== ecosystem.id) {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.background = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            if (activeFilter !== ecosystem.id) {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#ffffff';
            }
          }}
        >
          {ecosystem.color && (
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: ecosystem.color,
                flexShrink: 0
              }}
            />
          )}
          {ecosystem.label}
        </button>
      ))}
    </motion.div>
  );
}

export default EcosystemFilter;

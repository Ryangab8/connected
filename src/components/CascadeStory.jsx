import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllCascades, getSpeciesById } from '../lib/dataLoader';

function CascadeStory() {
  const { cascadeId } = useParams();
  const cascades = getAllCascades();
  const cascade = cascades.find(c => c.id === cascadeId);

  if (!cascade) {
    return <div className="loading">Cascade story not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        paddingTop: '70px',
        minHeight: '100vh',
        background: '#f8f7f4'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Back button */}
        <Link
          to="/stories"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#636e72',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d6a4f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#636e72'}
        >
          ← Back to all stories
        </Link>

        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#636e72',
            textTransform: 'capitalize',
            marginBottom: '1.5rem'
          }}>
            {cascade.ecosystem}
          </div>

          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2d3436' }}>
            {cascade.title}
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#636e72', marginBottom: '2rem' }}>
            {cascade.subtitle}
          </p>

          {/* Trigger */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#ef4444', marginBottom: '0.75rem', fontWeight: 600 }}>
              The Trigger
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0, color: '#2d3436' }}>
              {cascade.trigger}
            </p>
          </div>
        </motion.div>

        {/* Cascade steps timeline */}
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '2rem',
            top: '2rem',
            bottom: '2rem',
            width: '2px',
            background: '#e5e7eb'
          }} />

          {cascade.steps.map((step, i) => {
            const species = getSpeciesById(step.species);
            const statusColor = step.status === 'declining' ? '#ef4444' :
                               step.status === 'adapting' ? '#f59e0b' :
                               '#10b981';

            return (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                style={{
                  position: 'relative',
                  paddingLeft: '5rem',
                  marginBottom: '3rem'
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '1.35rem',
                  top: '1.5rem',
                  width: '1.3rem',
                  height: '1.3rem',
                  borderRadius: '50%',
                  background: statusColor,
                  border: '3px solid #f8f7f4',
                  zIndex: 2
                }} />

                {/* Step content */}
                <div style={{
                  padding: '1.5rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  {/* Step number */}
                  <div style={{ fontSize: '0.75rem', color: '#636e72', marginBottom: '0.5rem' }}>
                    Step {i + 1} of {cascade.steps.length}
                  </div>

                  {/* Species info */}
                  {species && (
                    <Link
                      to={`/species/${step.species}`}
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '1rem'
                      }}
                    >
                      <h3 className="species-name" style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#2d3436' }}>
                        {species.commonName}
                      </h3>
                      <p className="scientific-name" style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#636e72', fontStyle: 'italic' }}>
                        {species.scientificName}
                      </p>
                    </Link>
                  )}

                  {/* Status badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.75rem',
                    background: `${statusColor}10`,
                    border: `1px solid ${statusColor}`,
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: statusColor,
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}>
                    {step.status}
                  </div>

                  {/* Event description */}
                  <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72', margin: 0 }}>
                    {step.event}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* End note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 + cascade.steps.length * 0.15 }}
          style={{
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '1rem', color: '#636e72', marginBottom: '1.5rem' }}>
            This cascade shows how interconnected our ecosystems are — and why protecting every species matters.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#2d6a4f',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#235a42'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2d6a4f'}
          >
            Explore the full web
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CascadeStory;

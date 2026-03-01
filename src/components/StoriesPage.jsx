import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllCascades, getSpeciesById } from '../lib/dataLoader';

function StoriesPage() {
  const cascades = getAllCascades();

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
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '3rem', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2d3436' }}>
            Ecological Cascades
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#2d6a4f', maxWidth: '700px', margin: '0 auto' }}>
            How the decline of one species ripples through the interconnected web of life in the UK.
          </p>
        </motion.div>

        {/* Cascade stack (single column) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {cascades.map((cascade, i) => (
            <motion.div
              key={cascade.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Link
                to={`/stories/${cascade.id}`}
                style={{
                  display: 'block',
                  height: '100%',
                  padding: '2rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2d6a4f';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                {/* Ecosystem badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: '#f8f7f4',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#636e72',
                  textTransform: 'capitalize',
                  marginBottom: '1rem'
                }}>
                  {cascade.ecosystem}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#2d3436' }}>
                  {cascade.title}
                </h2>

                {/* Subtitle */}
                <p style={{ fontSize: '1rem', color: '#636e72', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {cascade.subtitle}
                </p>

                {/* Species chain */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#636e72', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Species chain
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {cascade.chain.map((speciesId, j) => {
                      const species = getSpeciesById(speciesId);
                      return (
                        <span
                          key={j}
                          style={{
                            padding: '0.4rem 0.75rem',
                            background: '#f8f7f4',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#2d3436'
                          }}
                        >
                          {species?.commonName || speciesId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ fontSize: '0.9rem', color: '#2d6a4f', fontWeight: 500 }}>
                  Read story →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default StoriesPage;

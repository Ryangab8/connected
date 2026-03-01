import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getSpeciesById,
  getSpeciesConnections,
  getCascadesForSpecies,
  getStatusLabel,
  getRelationshipLabel,
  getNodes
} from '../lib/dataLoader';

function SpeciesPanel({ speciesId, onClose, onMapView, onCascadeView }) {
  const [species, setSpecies] = useState(null);
  const [connections, setConnections] = useState({ outgoing: [], incoming: [] });
  const [cascades, setCascades] = useState([]);

  useEffect(() => {
    if (!speciesId) return;

    const speciesData = getSpeciesById(speciesId);
    const connectionsData = getSpeciesConnections(speciesId);
    const cascadesData = getCascadesForSpecies(speciesId);

    setSpecies(speciesData);
    setConnections(connectionsData);
    setCascades(cascadesData);
  }, [speciesId]);

  if (!species) return null;

  const statusLabel = getStatusLabel(species);
  const allNodes = getNodes();

  // Get species name by ID
  const getSpeciesName = (id) => {
    const node = allNodes.find(n => n.id === id);
    return node?.commonName || id;
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '400px',
        height: '100%',
        background: 'rgba(20, 20, 20, 0.95)',
        borderLeft: '1px solid #2a2a2a',
        backdropFilter: 'blur(20px)',
        overflowY: 'auto',
        padding: '2rem',
        zIndex: 100
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'transparent',
          border: 'none',
          color: '#a0a0a0',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.25rem',
          lineHeight: 1
        }}
      >
        ×
      </button>

      {/* Species header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          {species.commonName}
        </h2>
        <p className="scientific-name" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          {species.scientificName}
        </p>

        <div className={`status-badge status-${statusLabel.toLowerCase()}`}>
          {statusLabel}
        </div>
      </div>

      {/* Tagline */}
      {species.tagline && (
        <div style={{
          padding: '1rem',
          background: 'rgba(44, 95, 79, 0.2)',
          border: '1px solid rgba(44, 95, 79, 0.4)',
          borderRadius: '6px',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '0.875rem', fontStyle: 'italic', margin: 0, color: '#a0d5c5' }}>
            {species.tagline}
          </p>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
          About
        </h4>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#e8e8e8' }}>
          {species.description}
        </p>
      </div>

      {/* Key fact */}
      {species.keyFact && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
            Key Fact
          </h4>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#f39c12', fontWeight: 500 }}>
            {species.keyFact}
          </p>
        </div>
      )}

      <div className="divider" />

      {/* Connections */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
          Ecological Connections ({connections.outgoing.length + connections.incoming.length})
        </h4>

        {connections.outgoing.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h5 style={{ fontSize: '0.75rem', color: '#6a6a6a', marginBottom: '0.5rem', fontWeight: 600 }}>
              Affects:
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {connections.outgoing.map((conn, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(30, 30, 30, 0.5)',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#e8e8e8' }}>
                    {getSpeciesName(conn.targetId)}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                    {getRelationshipLabel(conn.type)}
                  </div>
                  {conn.description && (
                    <div style={{ color: '#6a6a6a', fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {conn.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {connections.incoming.length > 0 && (
          <div>
            <h5 style={{ fontSize: '0.75rem', color: '#6a6a6a', marginBottom: '0.5rem', fontWeight: 600 }}>
              Affected by:
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {connections.incoming.map((conn, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(30, 30, 30, 0.5)',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#e8e8e8' }}>
                    {getSpeciesName(conn.sourceId)}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                    {getRelationshipLabel(conn.type)}
                  </div>
                  {conn.description && (
                    <div style={{ color: '#6a6a6a', fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {conn.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          className="primary"
          onClick={() => onMapView(speciesId)}
          style={{ width: '100%' }}
        >
          See where it lives
        </button>

        {cascades.length > 0 && (
          <button
            onClick={() => onCascadeView(cascades[0])}
            style={{ width: '100%' }}
          >
            See the cascade
          </button>
        )}
      </div>

      {/* Conservation info */}
      {species.conservationStatus?.trendDetail && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a2a' }}>
          <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: '0.75rem' }}>
            Conservation Status
          </h4>
          <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: '#a0a0a0' }}>
            {species.conservationStatus.trendDetail}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default SpeciesPanel;

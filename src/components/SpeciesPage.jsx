import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import {
  getSpeciesById,
  getSpeciesConnections,
  getCascadesForSpecies,
  getStatusLabel,
  getRelationshipLabel,
  getSpeciesDistribution,
  getNodes
} from '../lib/dataLoader';
import SpeciesImage from './SpeciesImage';
import 'leaflet/dist/leaflet.css';

// Heatmap layer component
function HeatmapLayer({ points, color }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Convert points to [lat, lng, intensity] format
    const heatPoints = points.map(([lat, lon]) => [lat, lon, 0.6]);

    // Create heatmap layer with thermal gradient
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 10,
      blur: 12,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: 'rgba(255, 255, 255, 0)',
        0.2: '#3b82f6',  // Blue
        0.4: '#22d3ee',  // Cyan
        0.6: '#fbbf24',  // Yellow
        0.8: '#f97316',  // Orange
        1.0: '#ef4444'   // Red
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

function SpeciesPage() {
  const { speciesId } = useParams();
  const [species, setSpecies] = useState(null);
  const [connections, setConnections] = useState({ outgoing: [], incoming: [] });
  const [cascades, setCascades] = useState([]);
  const [distributionPoints, setDistributionPoints] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!speciesId) return;

    const speciesData = getSpeciesById(speciesId);
    const connectionsData = getSpeciesConnections(speciesId);
    const cascadesData = getCascadesForSpecies(speciesId);

    setSpecies(speciesData);
    setConnections(connectionsData);
    setCascades(cascadesData);
  }, [speciesId]);

  // Lazy load distribution data when map section is visible
  useEffect(() => {
    if (showMap && speciesId && distributionPoints.length === 0) {
      getSpeciesDistribution(speciesId).then(points => {
        setDistributionPoints(points);
      });
    }
  }, [showMap, speciesId, distributionPoints.length]);

  if (!species) return <div className="loading">Loading species data...</div>;

  const statusLabel = getStatusLabel(species);
  const allNodes = getNodes();

  const getSpeciesName = (id) => {
    const node = allNodes.find(n => n.id === id);
    return node?.commonName || id;
  };


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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Back button */}
        <Link
          to="/"
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
          ← Back to full web
        </Link>

        {/* Hero section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          {/* Hero image */}
          <SpeciesImage speciesId={speciesId} size="hero" showAttribution={true} />

          <h1 className="species-name" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', color: '#2d3436' }}>
            {species.commonName}
          </h1>
          <p className="scientific-name" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#636e72', fontStyle: 'italic' }}>
            {species.scientificName}
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div className={`status-badge status-${statusLabel.toLowerCase()}`}>
              {statusLabel}
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#636e72',
              textTransform: 'capitalize'
            }}>
              {species.ecosystem?.replace('-', ' ')}
            </div>
          </div>

          {species.tagline && (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(45, 106, 79, 0.05)',
              border: '2px solid #2d6a4f',
              borderRadius: '8px',
              fontSize: '1.25rem',
              lineHeight: 1.6,
              color: '#2d6a4f',
              fontStyle: 'italic'
            }}>
              {species.tagline}
            </div>
          )}
        </motion.div>

        {/* Key fact */}
        {species.keyFact && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: '1.5rem',
              background: '#ffffff',
              borderLeft: '4px solid #2d6a4f',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '3rem'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#636e72', marginBottom: '0.75rem' }}>
              Key Fact
            </h3>
            <p style={{ fontSize: '1.125rem', lineHeight: 1.7, margin: 0, color: '#2d3436' }}>
              {species.keyFact}
            </p>
          </motion.div>
        )}

        {/* About */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3436' }}>About</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72' }}>
            {species.description}
          </p>
        </motion.div>

        {/* The Web - connections */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2d3436' }}>
            The Web ({connections.outgoing.length + connections.incoming.length} connections)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {connections.outgoing.map((conn, i) => (
              <Link
                key={`out-${i}`}
                to={`/species/${conn.targetId}`}
                style={{
                  padding: '1.25rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2d6a4f';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3436', marginBottom: '0.5rem' }}>
                  {getSpeciesName(conn.targetId)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#2d6a4f', marginBottom: '0.5rem' }}>
                  {getRelationshipLabel(conn.type)}
                </div>
                {conn.description && (
                  <div style={{ fontSize: '0.875rem', color: '#636e72', lineHeight: 1.5 }}>
                    {conn.description}
                  </div>
                )}
              </Link>
            ))}

            {connections.incoming.map((conn, i) => (
              <Link
                key={`in-${i}`}
                to={`/species/${conn.sourceId}`}
                style={{
                  padding: '1.25rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2d6a4f';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3436', marginBottom: '0.5rem' }}>
                  {getSpeciesName(conn.sourceId)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#2d6a4f', marginBottom: '0.5rem' }}>
                  {getRelationshipLabel(conn.type)}
                </div>
                {conn.description && (
                  <div style={{ fontSize: '0.875rem', color: '#636e72', lineHeight: 1.5 }}>
                    {conn.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Where It Lives - Map section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2d3436' }}>
            Where It Lives
          </h2>

          {!showMap ? (
            <button
              onClick={() => setShowMap(true)}
              className="primary"
              style={{
                padding: '1rem 2rem',
                width: 'auto',
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#235a42'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2d6a4f'}
            >
              Load Distribution Map
            </button>
          ) : (
            <div style={{
              height: '500px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {distributionPoints.length > 0 ? (
                <MapContainer
                  center={[54.5, -4.0]}
                  zoom={6}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
                    maxZoom={16}
                    updateWhenZooming={false}
                    keepBuffer={4}
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={16}
                    updateWhenZooming={false}
                    keepBuffer={4}
                  />
                  <HeatmapLayer points={distributionPoints} color={species.color} />
                </MapContainer>
              ) : (
                <div className="loading">Loading distribution data...</div>
              )}
            </div>
          )}

          {showMap && distributionPoints.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#636e72' }}>
              {distributionPoints.length.toLocaleString()} occurrence records from GBIF
            </div>
          )}
        </motion.div>

        {/* Conservation */}
        {species.conservationStatus?.trendDetail && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: '1.5rem',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '3rem'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3436' }}>
              Conservation
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#636e72', marginBottom: '1rem' }}>
              {species.conservationStatus.trendDetail}
            </p>
            {species.conservationUrl && (
              <a
                href={species.conservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(45, 106, 79, 0.1)',
                  border: '1px solid #2d6a4f',
                  borderRadius: '6px',
                  color: '#2d6a4f',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 106, 79, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 106, 79, 0.1)';
                }}
              >
                Learn more →
              </a>
            )}
          </motion.div>
        )}

        {/* Cascades */}
        {cascades.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#2d3436' }}>
              The Cascade
            </h2>
            {cascades.map((cascade, i) => (
              <Link
                key={i}
                to={`/stories/${cascade.id}`}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2d6a4f';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2d3436' }}>
                  {cascade.title}
                </h3>
                <p style={{ fontSize: '1rem', color: '#636e72', marginBottom: '1rem' }}>
                  {cascade.subtitle}
                </p>
                <div style={{ fontSize: '0.875rem', color: '#2d6a4f', fontWeight: 500 }}>
                  Read the story →
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default SpeciesPage;

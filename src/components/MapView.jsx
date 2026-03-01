import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { getSpeciesById, getSpeciesDistribution, getStatusLabel } from '../lib/dataLoader';
import 'leaflet/dist/leaflet.css';

function MapView({ speciesId, onBackToWeb }) {
  const [species, setSpecies] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const speciesData = getSpeciesById(speciesId);
      const distributionPoints = await getSpeciesDistribution(speciesId);

      setSpecies(speciesData);
      setPoints(distributionPoints);
      setLoading(false);
    }

    if (speciesId) {
      loadData();
    }
  }, [speciesId]);

  if (loading) {
    return (
      <div className="loading">
        Loading distribution data...
      </div>
    );
  }

  if (!species) {
    return (
      <div className="loading">
        Species not found
      </div>
    );
  }

  // UK + Ireland center
  const center = [54.5, -4.0];
  const zoom = 6;

  const statusLabel = getStatusLabel(species);

  // Sample points if there are too many (for performance)
  const displayPoints = points.length > 5000
    ? points.filter((_, i) => i % Math.ceil(points.length / 5000) === 0)
    : points;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Plot occurrence points */}
        {displayPoints.map((point, i) => {
          const [lat, lon] = point;
          return (
            <CircleMarker
              key={i}
              center={[lat, lon]}
              radius={3}
              fillColor={species.color || '#27ae60'}
              color={species.color || '#27ae60'}
              weight={1}
              opacity={0.6}
              fillOpacity={0.4}
            >
              <Popup>
                <div style={{ color: '#0a0a0a' }}>
                  <strong>{species.commonName}</strong>
                  <br />
                  <em>{species.scientificName}</em>
                  <br />
                  Location: {lat.toFixed(3)}, {lon.toFixed(3)}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onBackToWeb}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 1000,
          padding: '0.75rem 1.5rem',
          background: 'rgba(20, 20, 20, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        ← Back to web
      </motion.button>

      {/* Species info panel */}
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          width: '320px',
          background: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)',
          zIndex: 1000
        }}
      >
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {species.commonName}
        </h3>
        <p className="scientific-name" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          {species.scientificName}
        </p>

        <div className={`status-badge status-${statusLabel.toLowerCase()}`} style={{ marginBottom: '1rem' }}>
          {statusLabel}
        </div>

        <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
          <strong>Distribution:</strong> {points.length.toLocaleString()} occurrence records
        </div>

        {displayPoints.length < points.length && (
          <div style={{ fontSize: '0.75rem', color: '#6a6a6a', fontStyle: 'italic' }}>
            Showing {displayPoints.length.toLocaleString()} sampled points for performance
          </div>
        )}

        {species.presentInIreland === false && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(243, 156, 18, 0.2)',
            border: '1px solid rgba(243, 156, 18, 0.4)',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#f39c12'
          }}>
            This species is found in Great Britain but not in Ireland
          </div>
        )}

        {species.tagline && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2a2a2a' }}>
            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#a0d5c5', margin: 0 }}>
              {species.tagline}
            </p>
          </div>
        )}
      </motion.div>

      {/* Data source attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(20, 20, 20, 0.9)',
          border: '1px solid #2a2a2a',
          borderRadius: '6px',
          fontSize: '0.7rem',
          color: '#6a6a6a',
          zIndex: 1000
        }}
      >
        Data source: GBIF (Global Biodiversity Information Facility)
      </motion.div>
    </div>
  );
}

export default MapView;

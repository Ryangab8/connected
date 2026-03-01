import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-polylinedecorator';
import {
  getNodes,
  getSpeciesDistribution,
  getAllCascades,
  getSpeciesConnections,
  getRelationshipLabel,
  calculateCentroid,
  getEcosystemColor
} from '../lib/dataLoader';
import SpeciesImage from './SpeciesImage';

// Heatmap Layer Component
function HeatmapLayer({ points, color, intensity = 0.6 }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Remove existing layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Convert points to heat format [lat, lon, intensity]
    const heatPoints = points.map(([lat, lon]) => [lat, lon, intensity]);

    // Create heatmap layer with thermal gradient (blue → yellow → red)
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 10,
      blur: 12,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: 'rgba(255, 255, 255, 0)',
        0.2: '#3b82f6',  // Blue - low density
        0.4: '#22d3ee',  // Cyan
        0.6: '#fbbf24',  // Yellow - medium density
        0.8: '#f97316',  // Orange
        1.0: '#ef4444'   // Red - high density
      }
    });

    heatLayer.addTo(map);
    layerRef.current = heatLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [points, color, intensity, map]);

  return null;
}

// Cascade Arrow Component
function CascadeArrows({ arrows, stepNumber, cascade, centroids }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    // Clear existing arrows and markers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    if (!cascade || stepNumber < 1) return;

    const color = getEcosystemColor(cascade.ecosystem);

    // Draw arrows (if any)
    arrows.forEach((arrow) => {
      const { from, to } = arrow;

      // Create thick solid polyline
      const polyline = L.polyline([from, to], {
        color: color,
        weight: 4,
        opacity: 0.9,
        pane: 'overlayPane' // Ensure arrows render above heatmap
      }).addTo(map);

      // Add arrowhead decorator
      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '100%',
            repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: 16,
              polygon: true,
              pathOptions: {
                fillOpacity: 0.9,
                weight: 0,
                color: color,
                fillColor: color
              }
            })
          }
        ]
      }).addTo(map);

      layersRef.current.push(polyline, decorator);
    });

    // Add numbered markers for all steps up to current step
    for (let i = 0; i < stepNumber; i++) {
      const speciesId = cascade.chain[i];
      const centroid = centroids[speciesId];

      if (centroid) {
        const markerIcon = L.divIcon({
          className: 'cascade-number',
          html: `<div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: white;
            border: 3px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            color: ${color};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${i + 1}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(centroid, {
          icon: markerIcon,
          pane: 'markerPane', // Ensure markers render above everything
          zIndexOffset: 1000
        }).addTo(map);

        layersRef.current.push(marker);
      }
    }

    return () => {
      layersRef.current.forEach(layer => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [arrows, stepNumber, cascade, centroids, map]);

  return null;
}

function MapPage() {
  const { speciesId } = useParams();
  const [mode, setMode] = useState('species'); // 'species' or 'cascades'
  const [selectedSpecies, setSelectedSpecies] = useState(speciesId || null);
  const [selectedCascade, setSelectedCascade] = useState(null);
  const [cascadeStep, setCascadeStep] = useState(0);
  const [distributionData, setDistributionData] = useState({});
  const [centroids, setCentroids] = useState({});
  const [loading, setLoading] = useState(false);

  const allSpecies = getNodes();
  const allCascades = getAllCascades();

  // Load distribution for a species
  const loadSpeciesDistribution = async (sid) => {
    if (distributionData[sid]) return;

    setLoading(true);
    const points = await getSpeciesDistribution(sid);
    setDistributionData(prev => ({ ...prev, [sid]: points }));

    // Calculate centroid
    const centroid = calculateCentroid(points);
    if (centroid) {
      setCentroids(prev => ({ ...prev, [sid]: centroid }));
    }

    setLoading(false);
  };

  // Load distribution when species selected
  useEffect(() => {
    if (selectedSpecies) {
      loadSpeciesDistribution(selectedSpecies);
    }
  }, [selectedSpecies]);

  // Load distributions for cascade species
  useEffect(() => {
    if (selectedCascade) {
      const cascade = allCascades.find(c => c.id === selectedCascade);
      if (cascade) {
        cascade.chain.forEach(sid => loadSpeciesDistribution(sid));
      }
    }
  }, [selectedCascade]);

  // Get connections for selected species
  const getConnectedSpecies = () => {
    if (!selectedSpecies) return [];

    const connections = getSpeciesConnections(selectedSpecies);
    const connected = [];

    connections.outgoing.forEach(c => {
      const species = allSpecies.find(s => s.id === c.targetId);
      if (species) {
        connected.push({
          species,
          type: c.type,
          direction: 'outgoing'
        });
      }
    });

    connections.incoming.forEach(c => {
      const species = allSpecies.find(s => s.id === c.sourceId);
      if (species) {
        connected.push({
          species,
          type: c.type,
          direction: 'incoming'
        });
      }
    });

    return connected;
  };

  // Get current cascade data
  const getCurrentCascade = () => {
    if (!selectedCascade) return null;
    return allCascades.find(c => c.id === selectedCascade);
  };

  // Get cascade arrows for current step
  // Step 1: No arrows (just marker 1)
  // Step 2: Arrow from 1→2 (markers 1 and 2)
  // Step 3: Arrows from 1→2 and 2→3 (markers 1, 2, and 3)
  const getCascadeArrows = () => {
    const cascade = getCurrentCascade();
    if (!cascade || cascadeStep <= 1) return []; // No arrows on step 1

    const arrows = [];
    const color = getEcosystemColor(cascade.ecosystem);

    // Create arrows from step 1 to current step
    for (let i = 0; i < cascadeStep - 1; i++) {
      const fromSpeciesId = cascade.chain[i];
      const toSpeciesId = cascade.chain[i + 1];

      const fromCentroid = centroids[fromSpeciesId];
      const toCentroid = centroids[toSpeciesId];

      if (fromCentroid && toCentroid) {
        arrows.push({
          from: fromCentroid,
          to: toCentroid,
          color: color
        });
      }
    }

    return arrows;
  };

  // Get points to display on map
  const getDisplayPoints = () => {
    if (mode === 'species' && selectedSpecies) {
      const species = allSpecies.find(s => s.id === selectedSpecies);
      return {
        points: distributionData[selectedSpecies] || [],
        color: species?.color || '#6b7280'
      };
    }

    if (mode === 'cascades' && selectedCascade) {
      const cascade = getCurrentCascade();
      if (cascade && cascadeStep > 0) {
        const currentSpeciesId = cascade.chain[cascadeStep - 1];
        const species = allSpecies.find(s => s.id === currentSpeciesId);
        return {
          points: distributionData[currentSpeciesId] || [],
          color: species?.color || getEcosystemColor(cascade.ecosystem)
        };
      }
    }

    return { points: [], color: '#6b7280' };
  };

  const displayData = getDisplayPoints();
  const connectedSpecies = mode === 'species' ? getConnectedSpecies() : [];
  const currentCascade = mode === 'cascades' ? getCurrentCascade() : null;
  const cascadeArrows = mode === 'cascades' ? getCascadeArrows() : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        paddingTop: '70px',
        height: '100vh',
        display: 'flex',
        background: '#f8f7f4'
      }}
    >
      {/* Sidebar */}
      <div style={{
        width: '320px',
        height: 'calc(100vh - 70px)',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mode Toggle */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: '#f8f7f4',
            padding: '4px',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => {
                setMode('species');
                setSelectedCascade(null);
                setCascadeStep(0);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: mode === 'species' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: mode === 'species' ? '#2d6a4f' : '#636e72',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: mode === 'species' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Species Explorer
            </button>
            <button
              onClick={() => {
                setMode('cascades');
                setSelectedSpecies(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: mode === 'cascades' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: mode === 'cascades' ? '#2d6a4f' : '#636e72',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: mode === 'cascades' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Cascade Stories
            </button>
          </div>
        </div>

        {/* Mode Content */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {mode === 'species' ? (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3436' }}>
                Species Explorer
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#636e72', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Select a species to view its distribution heatmap across the UK and Ireland.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {allSpecies.map(species => {
                  const isSelected = selectedSpecies === species.id;
                  const points = distributionData[species.id] || [];

                  return (
                    <div
                      key={species.id}
                      onClick={() => setSelectedSpecies(species.id)}
                      style={{
                        padding: '0.75rem',
                        background: isSelected ? `${species.color}15` : '#ffffff',
                        border: isSelected ? `2px solid ${species.color}` : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f8f7f4';
                          e.currentTarget.style.borderColor = species.color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <SpeciesImage speciesId={species.id} size="list" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.9rem',
                            fontWeight: isSelected ? 600 : 400,
                            color: '#2d3436',
                            marginBottom: '0.15rem'
                          }}>
                            {species.commonName}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#636e72',
                            fontStyle: 'italic'
                          }}>
                            {points.length > 0 ? `${points.length.toLocaleString()} records` : 'Click to load'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connections Section */}
              {selectedSpecies && connectedSpecies.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f8f7f4',
                  borderRadius: '8px'
                }}>
                  <h3 style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#2d3436',
                    marginBottom: '0.75rem'
                  }}>
                    Connected Species
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {connectedSpecies.slice(0, 5).map((conn, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSpecies(conn.species.id)}
                        style={{
                          padding: '0.5rem',
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = conn.species.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <SpeciesImage speciesId={conn.species.id} size="list" style={{ width: '32px', height: '32px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d3436', marginBottom: '0.25rem' }}>
                              {conn.species.commonName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#636e72' }}>
                              {getRelationshipLabel(conn.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {!selectedCascade ? (
                <>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3436' }}>
                    Cascade Stories
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#636e72', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Explore ecological cascades step-by-step to see how species impacts ripple across the landscape.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {allCascades.map(cascade => {
                      const color = getEcosystemColor(cascade.ecosystem);

                      return (
                        <div
                          key={cascade.id}
                          onClick={() => {
                            setSelectedCascade(cascade.id);
                            setCascadeStep(1);
                          }}
                          style={{
                            padding: '1rem',
                            background: '#ffffff',
                            border: `2px solid ${color}40`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.boxShadow = `0 2px 8px ${color}30`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${color}40`;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#2d3436',
                            marginBottom: '0.5rem'
                          }}>
                            {cascade.title}
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#636e72',
                            lineHeight: 1.5
                          }}>
                            {cascade.subtitle}
                          </div>
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            background: `${color}20`,
                            borderRadius: '4px',
                            display: 'inline-block',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: color,
                            textTransform: 'capitalize'
                          }}>
                            {cascade.ecosystem}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedCascade(null);
                        setCascadeStep(0);
                      }}
                      style={{
                        padding: '0.5rem',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: '#636e72'
                      }}
                    >
                      ← Back
                    </button>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#636e72',
                      fontWeight: 500
                    }}>
                      Step {cascadeStep} of {currentCascade?.chain.length || 0}
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#2d3436' }}>
                    {currentCascade?.title}
                  </h2>

                  {currentCascade && cascadeStep > 0 && (
                    <div style={{
                      padding: '1rem',
                      background: '#f8f7f4',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#2d3436',
                        marginBottom: '0.5rem'
                      }}>
                        {allSpecies.find(s => s.id === currentCascade.chain[cascadeStep - 1])?.commonName}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#636e72',
                        lineHeight: 1.5,
                        marginBottom: '0.75rem'
                      }}>
                        {currentCascade.steps[cascadeStep - 1]?.event}
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: currentCascade.steps[cascadeStep - 1]?.status === 'declining'
                          ? '#fee2e2'
                          : '#dcfce7',
                        border: `1px solid ${currentCascade.steps[cascadeStep - 1]?.status === 'declining'
                          ? '#dc2626'
                          : '#16a34a'}`,
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: currentCascade.steps[cascadeStep - 1]?.status === 'declining'
                          ? '#dc2626'
                          : '#16a34a',
                        textTransform: 'capitalize'
                      }}>
                        {currentCascade.steps[cascadeStep - 1]?.status}
                      </div>
                    </div>
                  )}

                  {/* Step Controls */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}>
                    <button
                      onClick={() => setCascadeStep(Math.max(1, cascadeStep - 1))}
                      disabled={cascadeStep <= 1}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: cascadeStep <= 1 ? '#f8f7f4' : '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: cascadeStep <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: cascadeStep <= 1 ? '#9ca3af' : '#2d6a4f'
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCascadeStep(Math.min(currentCascade?.chain.length || 0, cascadeStep + 1))}
                      disabled={cascadeStep >= (currentCascade?.chain.length || 0)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: cascadeStep >= (currentCascade?.chain.length || 0)
                          ? '#f8f7f4'
                          : '#2d6a4f',
                        border: cascadeStep >= (currentCascade?.chain.length || 0)
                          ? '1px solid #e5e7eb'
                          : 'none',
                        borderRadius: '6px',
                        cursor: cascadeStep >= (currentCascade?.chain.length || 0)
                          ? 'not-allowed'
                          : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: cascadeStep >= (currentCascade?.chain.length || 0)
                          ? '#9ca3af'
                          : '#ffffff'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {loading && (
          <div style={{
            padding: '1rem',
            background: '#f8f7f4',
            borderTop: '1px solid #e5e7eb',
            fontSize: '0.85rem',
            color: '#636e72',
            textAlign: 'center'
          }}>
            Loading distribution data...
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, height: 'calc(100vh - 70px)' }}>
        {displayData.points.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#636e72',
            fontSize: '1.25rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              {mode === 'species'
                ? 'Select a species from the panel to see its distribution'
                : 'Select a cascade story to begin the walkthrough'}
            </div>
          </div>
        ) : (
          <MapContainer
            center={[54.5, -4.0]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <HeatmapLayer
              points={displayData.points}
              color={displayData.color}
              intensity={0.6}
            />
            {mode === 'cascades' && currentCascade && cascadeStep > 0 && (
              <CascadeArrows
                arrows={cascadeArrows}
                stepNumber={cascadeStep}
                cascade={currentCascade}
                centroids={centroids}
              />
            )}
          </MapContainer>
        )}
      </div>
    </motion.div>
  );
}

export default MapPage;

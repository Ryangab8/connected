import React, { useState } from 'react';
import { getSpeciesImage } from '../lib/dataLoader';

function SpeciesImage({
  speciesId,
  size = 'hero', // 'hero', 'tooltip', 'list', 'thumbnail'
  style = {},
  showAttribution = false
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageData = getSpeciesImage(speciesId);

  if (!imageData) {
    return <ImagePlaceholder size={size} style={style} />;
  }

  // Use the direct URL from the data file - no transformation needed!
  // All URLs are now verified working URLs from Wikimedia Commons
  const imageUrl = imageData.url;

  // Style mapping for different sizes
  const containerStyles = {
    hero: {
      width: '100%',
      maxWidth: '1200px',
      height: '400px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      ...style
    },
    tooltip: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
      ...style
    },
    list: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      ...style
    },
    thumbnail: {
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: 0,
      ...style
    }
  };

  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: loading || error ? 'none' : 'block'
  };

  return (
    <>
      <div style={containerStyles[size]}>
        {(loading || error) && <ImagePlaceholder size={size} />}
        <img
          src={imageUrl}
          alt={imageData.alt}
          style={imageStyles}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      </div>
      {showAttribution && !error && !loading && (
        <div style={{
          fontSize: '0.75rem',
          color: '#636e72',
          marginTop: '0.5rem',
          marginBottom: '1rem'
        }}>
          Image: <a
            href={imageData.filePage}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2d6a4f', textDecoration: 'none' }}
          >
            {imageData.credit}
          </a>
          {' · '}
          {imageData.license}
        </div>
      )}
    </>
  );
}

function ImagePlaceholder({ size, style = {} }) {
  const containerStyles = {
    hero: {
      width: '100%',
      maxWidth: '1200px',
      height: '400px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      ...style
    },
    tooltip: {
      width: '80px',
      height: '80px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '1.5rem',
      ...style
    },
    list: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '1rem',
      ...style
    },
    thumbnail: {
      width: '60px',
      height: '60px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '1.25rem',
      ...style
    }
  };

  // Simple leaf icon using Unicode
  const icon = size === 'hero' ? '🍃' : '🌿';

  return (
    <div style={containerStyles[size]}>
      <span>{icon}</span>
    </div>
  );
}

export default SpeciesImage;

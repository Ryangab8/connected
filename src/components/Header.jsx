import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Logo/Title */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#2d6a4f',
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          Connected
        </h1>
        <p style={{
          fontSize: '0.7rem',
          color: '#636e72',
          margin: 0,
          marginTop: '-0.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          UK Biodiversity Web
        </p>
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/') && !location.pathname.includes('/species') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/') || location.pathname.includes('/species')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          The Web
          {isActive('/') && !location.pathname.includes('/species') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/map"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/map') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/map')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          Map
          {isActive('/map') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/biodiversity-outlook"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/biodiversity-outlook') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/biodiversity-outlook')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          Biodiversity Outlook
          {isActive('/biodiversity-outlook') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/policy-outlook"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/policy-outlook') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/policy-outlook')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          Policy Outlook
          {isActive('/policy-outlook') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/stories"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/stories') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/stories')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          Stories
          {isActive('/stories') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/act"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/act') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/act')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          Act
          {isActive('/act') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>

        <Link
          to="/about"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/about') ? '#2d6a4f' : '#636e72',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.color = '#2d6a4f'}
          onMouseLeave={(e) => {
            if (!isActive('/about')) {
              e.target.style.color = '#636e72';
            }
          }}
        >
          About
          {isActive('/about') && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#2d6a4f'
              }}
            />
          )}
        </Link>
      </nav>
    </motion.header>
  );
}

export default Header;

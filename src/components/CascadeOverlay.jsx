import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpeciesById } from '../lib/dataLoader';

function CascadeOverlay({ cascade, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < cascade.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < cascade.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3000); // 3 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, cascade.steps.length]);

  const handlePlay = () => {
    if (currentStep === cascade.steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < cascade.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = cascade.steps[currentStep];
  const currentSpecies = getSpeciesById(currentStepData.species);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '800px',
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '3rem',
          position: 'relative'
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
            fontSize: '2rem',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Cascade header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {cascade.title}
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#a0a0a0', marginBottom: '1rem' }}>
            {cascade.subtitle}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6a6a6a', lineHeight: 1.6 }}>
            {cascade.trigger}
          </p>
        </div>

        <div className="divider" />

        {/* Current step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '2rem' }}
          >
            {/* Step indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step {currentStep + 1} of {cascade.steps.length}
              </span>
              <div style={{ flex: 1, height: '2px', background: '#2a2a2a' }}>
                <div style={{
                  width: `${((currentStep + 1) / cascade.steps.length) * 100}%`,
                  height: '100%',
                  background: '#2c5f4f',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Species info */}
            {currentSpecies && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {currentSpecies.commonName}
                </h3>
                <p className="scientific-name" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {currentSpecies.scientificName}
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: currentStepData.status === 'declining' ? 'rgba(231, 76, 60, 0.2)' :
                              currentStepData.status === 'adapting' ? 'rgba(243, 156, 18, 0.2)' :
                              'rgba(39, 174, 96, 0.2)',
                  color: currentStepData.status === 'declining' ? '#e74c3c' :
                         currentStepData.status === 'adapting' ? '#f39c12' :
                         '#27ae60',
                  border: `1px solid ${currentStepData.status === 'declining' ? '#e74c3c' :
                                       currentStepData.status === 'adapting' ? '#f39c12' :
                                       '#27ae60'}`
                }}>
                  {currentStepData.status}
                </div>
              </div>
            )}

            {/* Event description */}
            <div style={{
              padding: '1.5rem',
              background: '#1e1e1e',
              borderLeft: '4px solid #2c5f4f',
              borderRadius: '4px'
            }}>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                {currentStepData.event}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              padding: '0.75rem 1.5rem',
              opacity: currentStep === 0 ? 0.3 : 1,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              {currentStep === cascade.steps.length - 1 ? 'Replay' : 'Play'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Pause
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentStep === cascade.steps.length - 1}
            style={{
              padding: '0.75rem 1.5rem',
              opacity: currentStep === cascade.steps.length - 1 ? 0.3 : 1,
              cursor: currentStep === cascade.steps.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>

        {/* Step dots indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem'
        }}>
          {cascade.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i === currentStep ? '#2c5f4f' : '#2a2a2a',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CascadeOverlay;

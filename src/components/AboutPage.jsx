import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function AboutPage() {
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#2d6a4f', fontWeight: 400 }}>
            An interactive exploration of UK biodiversity and ecological connections
          </h1>
        </motion.div>

        {/* Content sections */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#2d3436' }}>About</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72', marginBottom: '1rem' }}>
            Connected explores the intricate ecological relationships between 29 carefully selected UK wildlife species. Through an interactive network graph and distribution maps, it reveals how species depend on each other through predation, pollination, habitat provision, and more — and how the decline of one species can cascade through the entire ecosystem.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72' }}>
            This project combines curated ecological research with large-scale biodiversity data to make the invisible connections between species visible.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#2d3436' }}>Technical Stack</h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#636e72' }}>
            Built with React 18, Canvas API for network rendering, Leaflet for mapping, and Framer Motion for animations. The network uses fixed positioning rather than force-directed simulation — every species is precisely placed to create readable clusters by ecosystem.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#2d3436' }}>Sources & Attribution</h2>
          <ul style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#636e72', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://stateofnature.org.uk/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                State of Nature 2023 Report
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.iucnredlist.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                IUCN Red List
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://jncc.gov.uk/our-work/uk-bap-priority-species/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                UK BAP Priority Species
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.bto.org/our-science/publications/peer-reviewed-papers/birds-conservation-concern-5" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Birds of Conservation Concern 5
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.mammal.org.uk/science-research/red-list/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Mammal Society Red List
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.gbif.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                GBIF
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.bto.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                British Trust for Ornithology
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.rspb.org.uk/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Royal Society for the Protection of Birds
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.wildlifetrusts.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                The Wildlife Trusts
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.gov.uk/government/organisations/natural-england" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Natural England
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.nature.scot/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                NatureScot
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://naturalresources.wales/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Natural Resources Wales
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.daera-ni.gov.uk/northern-ireland-environment-agency" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Northern Ireland Environment Agency
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://jncc.gov.uk/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Joint Nature Conservation Committee
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.bumblebeeconservation.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Bumblebee Conservation Trust
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://butterfly-conservation.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Butterfly Conservation
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.mcsuk.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Marine Conservation Society
              </a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="https://www.woodlandtrust.org.uk/" target="_blank" rel="noopener noreferrer" style={{ color: '#2d6a4f', textDecoration: 'none' }}>
                Woodland Trust
              </a>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#2d3436' }}>Creator</h2>
          <div style={{
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: '#2d3436' }}>
              Emily Moreland
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#8a8f96', marginBottom: '1rem', fontStyle: 'italic' }}>
              Creator
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#636e72', margin: 0 }}>
              Graduated from the University of Exeter in 2022 with a degree in Conservation Biology and Ecology.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            padding: '2rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#636e72', marginBottom: '1.5rem' }}>
            Explore the connections that sustain UK wildlife — and see why protecting
            biodiversity means protecting entire ecosystems.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: '#2d6a4f',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#235a42'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2d6a4f'}
          >
            Explore the Web
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AboutPage;

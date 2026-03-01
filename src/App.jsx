import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import NetworkGraph from './components/NetworkGraph';
import RelationshipTypeFilter from './components/RelationshipTypeFilter';
import SpeciesPage from './components/SpeciesPage';
import StoriesPage from './components/StoriesPage';
import CascadeStory from './components/CascadeStory';
import ActPage from './components/ActPage';
import AboutPage from './components/AboutPage';
import MapPage from './components/MapPage';

function WebView() {
  const [relationshipFilter, setRelationshipFilter] = useState('all');

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#f8f7f4' }}>
      <Header />
      <RelationshipTypeFilter
        activeFilter={relationshipFilter}
        onFilterChange={setRelationshipFilter}
      />
      <NetworkGraph
        relationshipFilter={relationshipFilter}
      />
    </div>
  );
}

function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<WebView />} />
          <Route path="/species/:speciesId" element={
            <>
              <Header />
              <SpeciesPage />
            </>
          } />
          <Route path="/stories" element={
            <>
              <Header />
              <StoriesPage />
            </>
          } />
          <Route path="/stories/:cascadeId" element={
            <>
              <Header />
              <CascadeStory />
            </>
          } />
          <Route path="/act" element={
            <>
              <Header />
              <ActPage />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <AboutPage />
            </>
          } />
          <Route path="/map" element={
            <>
              <Header />
              <MapPage />
            </>
          } />
          <Route path="/map/:speciesId" element={
            <>
              <Header />
              <MapPage />
            </>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

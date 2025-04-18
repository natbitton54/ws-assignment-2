
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home/Home';
import Species from './Pages/Species/Species';
import Habitats from './Pages/Habitats/Habitats';
import TheSportsDB from './Pages/SportsDB/TheSportsDB';
import SubCollection from './Pages/SubCollection/SubCollection';
import './index.css';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zoologix/species" element={<Species />} />
        <Route path="/zoologix/habitats" element={<Habitats />} />
        <Route path="/zoologix/the-sport-db" element={<TheSportsDB />} />
        <Route path="/zoologix/sub-collection" element={<SubCollection />} />
        {/*
        <Route path="/zoologix/create" element={<Create />} />
        <Route path="/zoologix/delete" element={<Delete />} />
      */}
      </Routes>
      <Footer />
    </>
  );
};

export default App;

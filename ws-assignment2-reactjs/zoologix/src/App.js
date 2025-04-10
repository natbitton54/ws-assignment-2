
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home/Home';
import Species from './Pages/Species/Species';



const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zoologix/species" element={<Species />} />
        {/*

        <Route path="/zoologix/create" element={<Create />} />
        <Route path="/zoologix/delete" element={<Delete />} />
        <Route path="/zoologix/habitats" element={<Habitats />} />
        <Route path="/zoologix/sub-collection" element={<SubCollection />} />
        <Route path="/zoologix/the-sports-db" element={<TheSportsDB />} />
      */}
      </Routes>
      <Footer />
    </>
  );
};

export default App;


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
import DeleteResource from './Pages/DeleteResource/DeleteResource';
import CreateResource from './Pages/CreateResource/CreateResource';
import './index.css';

/**
 * Root component for the React application.
 * 
 * - Renders global layout including Navbar and Footer.
 * - Defines client-side routes using `react-router-dom`.
 * - Each route loads a specific page/component.
 * 
 * Routes:
 * - `/` → Home
 * - `/zoologix/species` → Species listing
 * - `/zoologix/habitats` → Habitats listing
 * - `/zoologix/the-sport-db` → SportsDB page
 * - `/zoologix/sub-collection` → Sub-collection view
 * - `/zoologix/create` → Create resource form
 * - `/zoologix/delete` → Delete resource tool
 * 
 * @component
 * @returns {JSX.Element} The main application layout and routes
 * 
 * @author `NatBitton54`
 */
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
        <Route path="/zoologix/create" element={<CreateResource />} />
        <Route path="/zoologix/delete" element={<DeleteResource />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;

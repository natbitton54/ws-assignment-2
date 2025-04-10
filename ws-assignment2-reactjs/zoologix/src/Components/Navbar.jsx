import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar-">
            <Link to="/" className="logo-">Zoologix</Link>

            <div className="nav-wrapper-">
                <input type="checkbox" id="nav-toggle" />
                <label htmlFor="nav-toggle" className="burger">
                    <span className="line1" />
                    <span className="line2" />
                    <span className="line3" />
                </label>

                <ul className="nav-link-">
                    <li><Link to="/zoologix/species">Species</Link></li>
                    <li><Link to="/zoologix/habitats">Habitats</Link></li>
                    <li><Link to="/zoologix/sub-collection">Sub-Collection</Link></li>
                    <li><Link to="/zoologix/the-sports-db">TheSportsDB</Link></li>
                    <li><Link to="/zoologix/create">Create</Link></li>
                    <li><Link to="/zoologix/delete">Delete</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

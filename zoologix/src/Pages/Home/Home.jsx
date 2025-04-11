import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <>
            <section className="hero">
                <div className="overlay">
                    <h1>Welcome to My Web Services Page for Assignment 2</h1>
                    <p>
                        Explore the collection resources, sub-collection, and TheSportsDB integration below.
                    </p>
                </div>
            </section>

            <section className="content">
                <h2>Site Features</h2>
                <p>
                    This assignment showcases multiple RESTful endpoints and a dynamic, reusable navbar.
                </p>

                <div className="cards">
                    <div className="card">
                        <h3>Species</h3>
                        <p>Explore data, search, filter, and interact with the server.</p>
                        <Link to="/zoologix/species" className="btn">Go</Link>
                    </div>

                    <div className="card">
                        <h3>Habitats</h3>
                        <p>Explore habitats and filtering options.</p>
                        <Link to="/zoologix/habitats" className="btn">Go</Link>
                    </div>

                    <div className="card">
                        <h3>Sub-Collection</h3>
                        <p>Nested resource interaction using REST.</p>
                        <Link to="/zoologix/sub-collection" className="btn">Go</Link>
                    </div>

                    <div className="card">
                        <h3>TheSportsDB Search</h3>
                        <p>Live API search for sports data.</p>
                        <Link to="/zoologix/the-sports-db" className="btn">Go</Link>
                    </div>

                    <div className="card">
                        <h3>Create Records</h3>
                        <p>Add species or habitat records.</p>
                        <Link to="/zoologix/create" className="btn">Create</Link>
                    </div>

                    <div className="card">
                        <h3>Delete Records</h3>
                        <p>Remove species or habitat records.</p>
                        <Link to="/zoologix/delete" className="btn">Delete</Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;

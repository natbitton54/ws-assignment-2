import React, { useEffect, useState } from 'react';
import './the-sports-db.css';
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const api = new FetchWrapper('https://www.thesportsdb.com/api/v1/json/3');

/**
 * TheSportsDB component allows users to search and view sports leagues
 * by country or sport using TheSportsDB public API.
 *
 * @component
 * @author `NatBitton54`
 */
const TheSportsDB = () => {
    const [sportsList, setSportsList] = useState([]);
    const [country, setCountry] = useState('');
    const [sport, setSport] = useState('');
    const [searchInitiated, setSearchInitiated] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

  /**
  * useEffect hook to load data from URL parameters when the page loads or changes.
  *
  * @function
  * @returns {void}
  */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryCountry = params.get('c') || '';
        const querySport = params.get('s') || '';
        setCountry(queryCountry);
        setSport(querySport);
        if (queryCountry || querySport) {
            loadSports(queryCountry, querySport);
        }
    }, [location.search]);


    /**
     * Fetches sports leagues from the API based on provided country and/or sport.
     * If no data is found or an error occurs, a SweetAlert is shown.
     *
     * @async
     * @function
     * @param {string} c - The country name (e.g., "Canada").
     * @param {string} s - The sport name (e.g., "Soccer").
     * @returns {Promise<void>}
     * @author `NatBitton54`
     */
    const loadSports = async (c, s) => {
        try {
            if (!c && !s) {
                Swal.fire('Missing Info', 'Please enter at least a sport or country.', 'warning');
                return;
            }

            let query = [];
            if (c) query.push(`c=${encodeURIComponent(c)}`);
            if (s) query.push(`s=${encodeURIComponent(s)}`);
            const endPoint = `/search_all_leagues.php?${query.join('&')}`;

            const res = await api.get(endPoint);

            // Uses whatever key has data: leagues or countries
            const data = Array.isArray(res.leagues)
                ? res.leagues
                : Array.isArray(res.countries)
                    ? res.countries
                    : [];

            setSportsList(data);

            if (data.length === 0) {
                Swal.fire('No Results', 'No leagues found for the given criteria.', 'info');
            }
        } catch (error) {
            Swal.fire('Error', `Could not load sports: ${error.message}`, 'error');
        }
    };


    /**
     * Updates the browser URL query string with the given country and sport.
     *
     * @function
     * @param {string} c - The country to set in the URL.
     * @param {string} s - The sport to set in the URL.
     * @returns {void}
     */
    const updateURL = (c, s) => {
        const params = new URLSearchParams();
        if (c) params.set('c', c);
        if (s) params.set('s', s);
        navigate(`?${params.toString()}`);
    };

    /**
     * Handles the form submit event to trigger a search.
     * Validates input and updates the URL to trigger a new fetch.
     *
     * @function
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     * @returns {void}
     * @author `NatBitton54`
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (!country.trim() && !sport.trim()) {
            return Swal.fire('Missing Info', 'Enter at least one search field.', 'warning');
        }

        const validPattern = /^[a-zA-Z0-9\s\-']+$/;
        if ((country && !validPattern.test(country)) || (sport && !validPattern.test(sport))) {
            return Swal.fire('Invalid Input', 'Only letters, numbers, spaces, hyphens, and apostrophes allowed.', 'info');
        }

        setSearchInitiated(true);
        updateURL(country.trim().toLowerCase(), sport.trim().toLowerCase());
    };

    /**
     * Clears all form inputs, resets the state, and navigates to the base route.
     *
     * @function
     * @returns {void}
     * @author `NatBitton54`
     */
    const handleClear = () => {
        setCountry('');
        setSport('');
        setSportsList([]);
        setSearchInitiated(false);
        navigate('');
        Swal.fire('Cleared', 'Search reset.', 'success');
    };

    return (
        <div className="container-">
            <div className="full-width-header">
                <h4>/thesportsdb/search_all_leagues</h4>
            </div>

            {/* Column-style form layout */}
            <form onSubmit={handleSearchSubmit} className="search-form d-flex flex-column gap-3">

                {/* Sport Search Box */}
                <div className="search-box-">
                    <div>
                        <label htmlFor="sport">Search by Sport:</label>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Sport (e.g., Soccer)"
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                    />
                    <button type="button" className="icon- clear-btn" onClick={handleClear}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button type="submit" className="icon- search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {/* Country Search Box */}
                <div className="search-box-">
                    <div>
                        <label htmlFor="country">Search by Country:</label>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Country (e.g., Canada)"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                    <button type="button" className="icon- clear-btn" onClick={handleClear}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button type="submit" className="icon- search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </form>

            {/* Manual fetch button */}
            <Link to="#" className="btn btn-link fetch-sports" onClick={(e) => {
                e.preventDefault();
                if (!country && !sport) {
                    return Swal.fire('Missing Info', 'Please enter a sport or country.', 'warning');
                }
                loadSports(country, sport);
            }}>
                Fetch Sports Leagues
            </Link>

            {/* Result Table */}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>League ID</th>
                            <th>League Sport</th>
                            <th>Country</th>
                            <th>League Name</th>
                            <th>Year Formed</th>
                            <th>League Gender</th>
                            <th>Description</th>
                            <th>Badge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sportsList.map((league) => (
                            <tr key={league.idLeague}>
                                <td>{league.idLeague}</td>
                                <td>{league.strSport || '—'}</td>
                                <td>{league.strCountry || '—'}</td>
                                <td>{league.strLeague || '—'}</td>
                                <td>{league.intFormedYear || '—'}</td>
                                <td>{league.strGender || '—'}</td>
                                <td>{league.strDescriptionEN || '—'}</td>
                                <td>
                                    {league.strBadge ? (
                                        <img
                                            src={league.strBadge}
                                            alt="League Badge"
                                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                        />
                                    ) : '—'}
                                </td>
                            </tr>
                        ))}
                        {searchInitiated && sportsList.length === 0 && (
                            <tr><td colSpan="8" className="text-center">No results found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TheSportsDB;

import React, { useEffect, useState } from 'react';
import './the-sports-db.css';
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const api = new FetchWrapper('https://www.thesportsdb.com/api/v1/json/3');

const TheSportsDB = () => {
    const [sportsList, setSportsList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [filter, setFilter] = useState(''); // 's' or 'c'
    const [country, setCountry] = useState('');
    const [sport, setSport] = useState('');
    const [searchInitiated, setSearchInitiated] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryCountry = params.get('c') || '';
        const querySport = params.get('s') || '';
        setCountry(queryCountry);
        setSport(querySport);
        if (queryCountry && querySport) {
            loadSports(queryCountry, querySport, false);
        }
    }, [location.search]);

    const loadSports = async (c, s, showAlertIfEmpty = true) => {
        try {
            if (!c || !s) {
                if (showAlertIfEmpty) {
                    Swal.fire('Missing Info', 'Both country and sport must be selected.', 'warning');
                }
                return;
            }

            const endPoint = `/search_all_leagues.php?c=${encodeURIComponent(c)}&s=${encodeURIComponent(s)}`;
            const res = await api.get(endPoint);
            const data = res.leagues ?? res.countries ?? [];

            setSportsList(data);

            if (data.length === 0 && showAlertIfEmpty) {
                Swal.fire('Error', 'No records found for the selected country and sport.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', `Could not load sports: ${error.message}`, 'error');
        }
    };

    const updateURL = (c, s) => {
        const params = new URLSearchParams();
        if (c) params.set('c', c);
        if (s) params.set('s', s);
        navigate(`?${params.toString()}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (!filter || !searchName.trim()) {
            return Swal.fire('Missing Info', 'Please select a filter and enter a value.', 'warning');
        }

        const validPattern = /^[a-zA-Z0-9\s\-']+$/;
        if (!validPattern.test(searchName)) {
            return Swal.fire('Invalid Input', 'Only letters, numbers, spaces, hyphens, apostrophes allowed.', 'info');
        }

        let c = country;
        let s = sport;

        if (filter === 'c') {
            c = searchName.toLowerCase();
        } else if (filter === 's') {
            s = searchName.toLowerCase();
        }

        c = c.toLowerCase();
        s = s.toLowerCase();


        if (!c || !s) {
            return Swal.fire('Missing Info', 'Please fill both country and sport.', 'warning');
        }

        setSearchInitiated(true);
        updateURL(c, s);
    };

    const handleClear = () => {
        setSearchName('');
        setFilter('');
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

            <form onSubmit={handleSearchSubmit} className="search-form d-flex gap-2">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder={filter ? `Search by ${filter === 's' ? 'Sport' : 'Country'}` : "Choose a filter first"}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        disabled={!filter}
                        required
                    />
                    <button type="button" className="icon clear-btn" onClick={handleClear}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button type="submit" className="icon search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {/* Dropdown to pick whether searchName is Country or Sport */}
                <div className="filter-dropdown" style={{ marginRight: '20px' }}>
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setSearchName('');
                        }}
                        required
                    >
                        <option value="">Select Filter (s=Sport / c=Country)</option>
                        <option value="s">Sport (e.g., Soccer)</option>
                        <option value="c">Country (e.g., England)</option>
                    </select>
                </div>

                {/* Dropdown for the opposite filter */}
                <div className="filter-dropdown">
                    <select
                        className="form-select"
                        value={filter === 'c' ? sport : country}
                        onChange={(e) => {
                            if (filter === 'c') setSport(e.target.value.toLowerCase());
                            else setCountry(e.target.value.toLowerCase());
                        }}
                        required
                    >
                        <option value="">{filter === 'c' ? 'Select Sport' : 'Select Country'}</option>
                        {filter === 'c' ? (
                            <>
                                <option value="soccer">Soccer</option>
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                                <option value="ice hockey">Hockey</option>
                            </>
                        ) : (
                            <>
                                <option value="canada">Canada</option>
                                <option value="england">England</option>
                                <option value="spain">Spain</option>
                                <option value="united states">USA</option>
                            </>
                        )}
                    </select>
                </div>
            </form>

            <Link to="#" className="btn btn-link fetch-sports" onClick={(e) => {
                e.preventDefault();
                if (!country || !sport) {
                    return Swal.fire('Missing Info', 'Both country and sport must be selected.', 'warning');
                }
                loadSports(country, sport, true);
            }}>
                Fetch Sports Leagues
            </Link>

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

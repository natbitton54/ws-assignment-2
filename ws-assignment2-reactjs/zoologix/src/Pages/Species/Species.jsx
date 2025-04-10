import React, { useEffect, useState } from 'react';
import './Species.css';
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import { Link } from 'react-router-dom';

const api = new FetchWrapper('http://localhost/species-api');

const Species = () => {
    const [speciesList, setSpeciesList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadSpecies();
    }, [page, pageSize]);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);


    const loadSpecies = async () => {
        try {
            const response = await api.get(`/species?page=${page}&pageSize=${pageSize}`);
            const data = response.data || [];
            setSpeciesList(data);
            setTotalPages(response.metadata?.total_pages || 1);

            if (data.length === 0) {
                Swal.fire('Info', 'No species records available.', 'info');
            }
        } catch (error) {
            Swal.fire('Error', `Could not load species: ${error.message}`, 'error');
        }
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!searchName.trim()) {
            return Swal.fire('Info', 'Please enter a species name to search.', 'info');
        }

        const validNamePattern = /^[A-Za-z0-9\s\-']+$/;
        if (!validNamePattern.test(searchName)) {
            return Swal.fire(
                'Invalid input',
                'Allowed characters: letters, numbers, spaces, hyphens, apostrophes.',
                'info'
            );
        }

        try {
            const response = await api.get(
                `/species?name=${encodeURIComponent(searchName)}&filter=${encodeURIComponent(filter)}`
            );
            const data = response.data || [];
            if (!data.length) {
                setSpeciesList([]);
                return Swal.fire('Info', 'No records found.', 'info');
            }
            setSpeciesList(data);
            Swal.fire('Success', 'Species data retrieved successfully!', 'success');
        } catch (error) {
            Swal.fire('Error', `Failed to retrieve data: ${error.message}`, 'error');
        }
    };

    const handleClear = async () => {
        setSearchName('');
        setFilter('');
        setPage(1);
        await loadSpecies();
        Swal.fire('Cleared', 'Search reset. Displaying all species.', 'success');
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const renderPagination = () => {
        const items = [];

        const visiblePages = 5;
        let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
        let endPage = startPage + visiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - visiblePages + 1);
        }

        if (page > 1) {
            items.push(
                <li key="prev" className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(page - 1)}>Previous</button>
                </li>
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
                </li>
            );
        }

        if (page < totalPages) {
            items.push(
                <li key="next" className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(page + 1)}>Next</button>
                </li>
            );
        }

        return <ul className="pagination justify-content-center">{items}</ul>;
    };


    return (
        <div className="container-">
            <div className="full-width-header">
                <h4>/zoologix/species</h4>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Enter species name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        required
                    />
                    <button type="button" className="icon clear-btn" onClick={handleClear}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button type="submit" className="icon search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
                <div className="filter-dropdown" style={{ marginRight: '20px' }}>
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Select Filter</option>
                        <option value="name">Name</option>
                        <option value="habitat">Habitat</option>
                        <option value="diet">Diet</option>
                        <option value="phylum">Phylum</option>
                        <option value="class">Class</option>
                        <option value="order">Order</option>
                    </select>
                </div>
                <div className="filter-dropdown">
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Select Filter</option>
                        <option value="name">Name</option>
                        <option value="habitat">Habitat</option>
                        <option value="diet">Diet</option>
                        <option value="phylum">Phylum</option>
                        <option value="class">Class</option>
                        <option value="order">Order</option>
                    </select>
                </div>
            </form>

            <Link href="#" className="fetch-species" onClick={(e) => { e.preventDefault(); loadSpecies(); }}>
                Fetch Species
            </Link>

                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {[
                                    'Species ID', 'Common Name', 'Description', 'Name of Offspring', 'Group Behaviour',
                                    'Gestation Period', 'Breeding Season', 'Number of Offspring', 'Average Lifespan',
                                    'Date Added', 'Diet ID', 'Habitat ID', 'Classification ID', 'Name', 'Diet Type',
                                    'Food Items', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Status Code'
                                ].map((header, i) => <th key={i}>{header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {speciesList.map((species, index) => (
                                <tr key={index}>
                                    <td>{species.species_id}</td>
                                    <td>{species.common_name}</td>
                                    <td>{species.description}</td>
                                    <td>{species.name_of_offspring}</td>
                                    <td>{species.group_behaviour}</td>
                                    <td>{species.gestation_period}</td>
                                    <td>{species.breeding_season}</td>
                                    <td>{species.num_of_offspring}</td>
                                    <td>{species.average_lifespan}</td>
                                    <td>{species.date_added}</td>
                                    <td>{species.diet_id}</td>
                                    <td>{species.habitat_id}</td>
                                    <td>{species.classification_id}</td>
                                    <td>{species.name}</td>
                                    <td>{species.diet_type}</td>
                                    <td>{species.food_items}</td>
                                    <td>{species.kingdom}</td>
                                    <td>{species.phylum}</td>
                                    <td>{species.class}</td>
                                    <td>{species.order}</td>
                                    <td>{species.family}</td>
                                    <td>{species.genus}</td>
                                    <td>{species.status_code}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div
                    className="d-flex justify-content-center align-items-center my-4 position-relative"
                    style={{ width: '100%' }}
                >
                    {/* Pagination - Centered */}
                    <div>{renderPagination()}</div>

                    {/* Page Size Dropdown - Right Aligned Absolute */}
                    <div
                        className="position-absolute"
                        style={{ right: '20px' }}
                    >
                        <select
                            className="form-select w-auto"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(parseInt(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                        </select>
                    </div>
                </div>

                <div style={{marginTop: '50px'}}>
                </div>
            </div>
    );
};

export default Species;

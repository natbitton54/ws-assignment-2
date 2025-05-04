import React, { use, useEffect, useState } from 'react'
import './Habitats.css'
import Swal from 'sweetalert2'
import { FetchWrapper, loadNavbar } from '../../utils/fetchWrapper'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Pagination from '../../Components/Pagination'

const api = new FetchWrapper('http://localhost/species-api');

/**
 * Habitats component
 *
 * Displays and manages a paginated, filterable list of habitats from the `/habitats` API.
 * - Supports searching by name, climate, location, and description.
 * - Implements pagination and page size selection.
 * - Shows alerts on errors or no search results.
 *
 * @component
 * @returns {JSX.Element} Rendered habitat list with filters, pagination, and fetch logic.
 * 
 * @author `NatBitton54`
 */
function Habitats() {
    const [habitatsList, setHabitatsList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();
    const location = useLocation();

    /**
     * useEffect - Initializes state from URL query parameters on component load or URL change.
     *
     * Extracts values for page, pageSize, name, and filter from the URL and sets the corresponding state.
     * Then triggers habitat data loading with those values.
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryPage = parseInt(params.get('page')) || 1;
        const querySize = parseInt(params.get('pageSize')) || 5;
        const queryName = params.get('name') || '';
        const queryFilter = params.get('filter') || '';

        setPage(queryPage);
        setPageSize(querySize);
        setSearchName(queryName);
        setFilter(queryFilter);

        loadHabitats(queryPage, querySize, queryName, queryFilter);
    }, [location.search]);

    /**
     * useEffect - Dynamically loads Bootstrap CSS into the document head.
     * Removes it on component unmount.
     */
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    /**
     * loadHabitats
     * 
     * Fetches habitats from the API based on pagination and optional filter/search values.
     *
     * @param {number} pageToLoad - Current page to fetch.
     * @param {number} size - Number of results per page.
     * @param {string} name - Search term (optional).
     * @param {string} filterBy - Field to filter by (optional).
     */
    const loadHabitats = async (pageToLoad = page, size = pageSize, name = searchName, filterBy = filter) => {
        try {
            let endPoint = `/habitats?page=${pageToLoad}&pageSize=${size}`;
            const isSearch = name.trim() && filterBy;

            if (isSearch) {
                endPoint += `&${encodeURIComponent(filterBy)}=${encodeURIComponent(name)}`;
            }

            const res = await api.get(endPoint);
            const data = res.data || [];

            setHabitatsList(data);
            setTotalPages(res.metadata?.total_pages || 1);

            if (isSearch && data.length === 0) {
                Swal.fire('No Results', 'No records found with the selected search criteria.', 'info');
            }
        } catch (error) {
            Swal.fire('Error', `Could not load habitats: ${error.message}`, 'error');
        }
    }

    /**
     * updateURL
     *
     * Updates the browser's URL with the given parameters.
     * Useful for preserving navigation and enabling deep linking.
     *
     * @param {Object} paramObj - Object containing filter, name, page, and pageSize.
     * @author `NatBitton54`
     */
    const updateURL = (paramObj) => {
        const params = new URLSearchParams();

        if (paramObj.filter) params.set('filter', paramObj.filter);
        if (paramObj.name) params.set('name', paramObj.name);

        params.set('page', paramObj.page);
        params.set('pageSize', paramObj.pageSize);

        navigate(`?${params.toString()}`);
    };


    /**
   * handleSearchSubmit
   *
   * Handles form submission for searching habitats.
   * Validates input, updates the URL, and triggers a new fetch.
   *
   * @param {Event} e - Form submission event.
   * @author `NatBitton54`
   */
    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!searchName.trim()) {
            Swal.fire('Error', 'Please enter a search term.', 'error');
            return;
        }

        const validPattern = /^[A-Za-z0-9\s\-']+$/;
        if (!validPattern.test(searchName)) {
            return Swal.fire('Invalid input', 'Allowed characters: letters, numbers, spaces, hyphens, apostrophes.', 'info');
        }

        updateURL({ name: searchName, filter: filter, page: 1, pageSize: pageSize });
    }
    
    /**
     * handleClearSearch
     *
     * Clears all search and filter inputs, resets pagination,
     * and fetches the full unfiltered dataset.
     * @author `NatBitton54`
     */
    const handleClearSearch = () => {
        setSearchName('');
        setFilter('');
        setPage(1);
        updateURL({ page: 1, pageSize });
        Swal.fire('Cleared', 'Search reset. Displaying all habitats.', 'success');
    }

    /**
     * handlePageChange
     *
     * Updates the page and triggers data reloading for the selected page.
     *
     * @param {number} newPage - The new page number.
     * @author `NatBitton54`
     */
    const handlePageChange = (newPage) => {
        setPage(newPage);
        updateURL({ name: searchName, filter, page: newPage, pageSize });
    };

    /**
     * handlePageSizeChange
     *
     * Updates the number of items per page and resets to the first page.
     *
     * @param {number} newPageSize - The new page size to apply.
     * @author `NatBitton54`
     */
    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);
        updateURL({ name: searchName, filter, page: 1, pageSize: newPageSize });
    };

    return (
        <div className="container-">
            <div className="full-width-header">
                <h4>/species-api/habitats</h4>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder={filter ? `Search by ${filter}` : "Choose a filter first"}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        disabled={!filter}
                        required
                    />
                    <button type="button" className="icon clear-btn" onClick={handleClearSearch}>
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
                        required
                    >
                        <option value="">Select Filter</option>
                        <option value="name">Name</option>
                        <option value="climate">Climate</option>
                        <option value="location">Location</option>
                        <option value="description">Description</option>
                    </select>
                </div>
            </form>

            <Link to="#" className='fetch-habitats' onClick={(e) => { e.preventDefault(); loadHabitats() }}>
                Fetch Habitats
            </Link>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            {[
                                'Habitat ID',
                                'Name',
                                'Climate',
                                'Location',
                                'Longitude Range',
                                'Latitude Range',
                                'Description',
                            ].map((header, i) => <th key={i}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {habitatsList.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="not-found">No habitats found.</td>
                            </tr>
                        ) : habitatsList.map((s, i) => (
                            <tr key={i}>
                                <td>{s.habitat_id}</td>
                                <td>{s.name}</td>
                                <td>{s.climate}</td>
                                <td>{s.location}</td>
                                <td>{s.longitude_range}</td>
                                <td>{s.latitude_range}</td>
                                <td>{s.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div
                className="d-flex justify-content-center align-items-center my-4 position-relative"
                style={{ width: '100%' }}
            >
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    visiblePages={5}
                    onPageChange={handlePageChange}
                />

                <div className="position-absolute" style={{ right: '20px' }}>
                    <select
                        className="form-select w-auto"
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '50px' }} />
        </div>
    )
}

export default Habitats

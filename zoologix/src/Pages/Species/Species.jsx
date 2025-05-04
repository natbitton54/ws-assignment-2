import React, { useEffect, useState } from 'react';
import './Species.css';
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../../Components/Pagination';

const api = new FetchWrapper('http://localhost/species-api');

/**
 * Species component
 *
 * Displays a paginated and filterable list of species from the `/species-api/species` endpoint.
 * - Supports filtering by name, description, diet, genus, class, and order.
 * - Allows search queries to be submitted and clears them as needed.
 * - Updates the URL with query parameters for deep linking or browser navigation.
 * - Uses SweetAlert2 for friendly error/info feedback and Bootstrap for styling.
 *
 * Pagination is handled using a separate Pagination component, and page size can be changed.
 * 
 * @component
 * @returns {JSX.Element} A searchable, paginated table of species data.
 * 
 * @author `NatBitton54`
 */
const Species = () => {
    const [speciesList, setSpeciesList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();
    const location = useLocation();

    /**
    * useEffect hook that runs when the URL query parameters change.
    *
    * - Extracts `page`, `pageSize`, `name`, and `filter` from the URL.
    * - Updates corresponding state variables.
    * - Triggers data fetching (`loadSpecies`) using extracted values.
    *
    * Dependencies:
    * - Triggers only when `location.search` changes.
    * 
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

        loadSpecies(queryPage, querySize, queryName, queryFilter);
    }, [location.search]);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    /**
     * Loads species data from the API based on pagination and filter options.
     *
     * @async
     * @function
     * @param {number} [pageToLoad=page] - The page number to fetch.
     * @param {number} [size=pageSize] - The number of records per page.
     * @param {string} [name=searchName] - The value to search/filter by.
     * @param {string} [filterBy=filter] - The field to apply the filter on.
     * @returns {Promise<void>}
     * @author `NatBitton54`
     */
    const loadSpecies = async (pageToLoad = page, size = pageSize, name = searchName, filterBy = filter) => {
        try {
            let endpoint = `/species?page=${pageToLoad}&pageSize=${size}`;

            const isSearch = name.trim() && filterBy;

            if (isSearch) {
                endpoint += `&${encodeURIComponent(filterBy)}=${encodeURIComponent(name)}`;
            }


            const response = await api.get(endpoint);
            const data = response.data || [];

            setSpeciesList(data);
            setTotalPages(response.metadata?.total_pages || 1);

            // Show alert ONLY when searching and no results found
            if (isSearch && data.length === 0) {
                Swal.fire('No Results', 'No records found with the selected search criteria.', 'info');
            }
        } catch (error) {
            Swal.fire('Error', `Could not load species: ${error.message}`, 'error');
        }
    };


    /**
     * Updates the browser's URL with the given query parameters.
     *
     * @function
     * @param {Object} paramsObj - Parameters to include in the query string.
     * @param {string} [paramsObj.name] - Search term.
     * @param {string} [paramsObj.filter] - Filter type.
     * @param {number} paramsObj.page - Current page.
     * @param {number} paramsObj.pageSize - Number of items per page.
     * @author `NatBitton54`
     */
    const updateURL = (paramsObj) => {
        const params = new URLSearchParams();

        if (paramsObj.name) params.set('name', paramsObj.name);
        if (paramsObj.filter) params.set('filter', paramsObj.filter);
        params.set('page', paramsObj.page);
        params.set('pageSize', paramsObj.pageSize);

        navigate(`?${params.toString()}`);
    };

    /**
     * Handles form submission for filtering/searching species.
     *
     * @async
     * @function
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
     * @returns {Promise<void>}
     * @author `NatBitton54`
     */
    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!searchName.trim()) {
            return Swal.fire('Info', 'Please enter a search term to search.', 'info');
        }

        const validPattern = /^[A-Za-z0-9\s\-']+$/;
        if (!validPattern.test(searchName)) {
            return Swal.fire('Invalid input', 'Allowed characters: letters, numbers, spaces, hyphens, apostrophes.', 'info');
        }

        updateURL({ name: searchName, filter, page: 1, pageSize });
    };

    /**
     * Clears the current search input and filter, resets pagination, and updates the URL.
     *
     * @function
     * @author `NatBitton54`
     */
    const handleClear = () => {
        setSearchName('');
        setFilter('');
        setPage(1);
        updateURL({ page: 1, pageSize });
        Swal.fire('Cleared', 'Search reset. Displaying all species.', 'success');
    };

    /**
     * Handles pagination changes triggered by the Pagination component.
     *
     * @function
     * @param {number} newPage - New page number selected by the user.
     * @author `NatBitton54`
     */
    const handlePageChange = (newPage) => {
        setPage(newPage);
        updateURL({ name: searchName, filter, page: newPage, pageSize });
    };

    /**
     * Handles the change in page size and resets page to 1.
     *
     * @function
     * @param {number} newSize - New page size selected by the user.
     * @author `NatBitton54`
     */
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1);
        updateURL({ name: searchName, filter, page: 1, pageSize: newSize });
    };

    return (
        <div className="container-">
            <div className="full-width-header">
                <h4>/species-api/species</h4>
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
                        required
                    >
                        <option value="">Select Filter</option>
                        <option value="name">Name</option>
                        <option value="description">Description</option>
                        <option value="diet">Diet</option>
                        <option value="genus">Genus</option>
                        <option value="class">Class</option>
                        <option value="order">Order</option>
                    </select>
                </div>
            </form>

            <Link to="#" className="fetch-species" onClick={(e) => { e.preventDefault(); loadSpecies(); }}>
                Fetch Species
            </Link>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            {[
                                'Species ID', 'Common Name', 'Description', 'Name of Offspring', 'Group Behaviour',
                                'Gestation Period', 'Breeding Season', 'Number of Offspring', 'Average Lifespan',
                                'Date Added', 'Diet ID','Habitat ID', 'Classification ID', 'Name', 'Diet Type',
                                'Food Items', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Status Code'
                            ].map((header, i) => <th key={i}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {speciesList.length === 0 ? (
                            <tr>
                                <td colSpan="21" className="not-found">No species found</td>
                            </tr>
                        ) : speciesList.map((s, i) => (
                            <tr key={i}>
                                <td>{s.species_id}</td>
                                <td>{s.common_name}</td>
                                <td>{s.description}</td>
                                <td>{s.name_of_offspring}</td>
                                <td>{s.group_behaviour}</td>
                                <td>{s.gestation_period}</td>
                                <td>{s.breeding_season}</td>
                                <td>{s.num_of_offspring}</td>
                                <td>{s.average_lifespan}</td>
                                <td>{s.date_added}</td>
                                <td>{s.diet_id}</td>
                                <td>{s.habitat_id}</td>
                                <td>{s.classification_id}</td>
                                <td>{s.name}</td>
                                <td>{s.diet_type}</td>
                                <td>{s.food_items}</td>
                                <td>{s.kingdom}</td>
                                <td>{s.phylum}</td>
                                <td>{s.class}</td>
                                <td>{s.order}</td>
                                <td>{s.family}</td>
                                <td>{s.genus}</td>
                                <td>{s.status_code}</td>
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
    );
};

export default Species;

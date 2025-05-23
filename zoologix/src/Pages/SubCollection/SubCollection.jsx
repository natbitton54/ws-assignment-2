import React, { use, useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../../Components/Pagination';
import './sub-collection.css';

const api = new FetchWrapper('http://localhost/species-api');

/**
 * SubCollection component
 *
 * Displays a paginated list of species filtered by selected habitat.
 * - Loads all available habitat IDs for dropdown selection.
 * - Fetches species records belonging to the selected habitat.
 * - Supports pagination and page size adjustments.
 *
 * Uses:
 * - FetchWrapper for API requests
 * - SweetAlert2 for user-friendly error alerts
 * - Pagination component for navigation
 *
 * @component
 * @returns {JSX.Element} A UI for selecting a habitat and viewing associated species.
 * 
 * @author `NatBitton54`
 */
function SubCollection() {
  const [habitatsId, setHabitatsId] = useState([]);
  const [selectedHabitatId, setSelectedHabitatId] = useState('');
  const [speciesList, setSpeciesList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * On component mount or URL change:
   * - Fetch all habitat IDs.
   * - If URL has habitat, page, or pageSize, trigger a filtered data load.
   *
   * @returns {void}
   */
  useEffect(() => {
    fetchHabitatsId();
    const params = new URLSearchParams(location.search);
    const habitat = params.get('habitat') || '';
    const page = parseInt(params.get('page')) || 1;
    const size = parseInt(params.get('pageSize')) || 5;

    if (habitat) {
      setSelectedHabitatId(habitat);
      loadSubCollection(habitat, page, size);
    }
  }, [location.search]);

  /**
   * Fetches all habitat IDs across paginated API responses and sets them to state.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   * @author `NatBitton54`
   */
  const fetchHabitatsId = async () => {
    try {
      let allData = [];
      let page = 1
      let totalPages = 1;

      do {
        const res = await api.get(`/habitats?page=${page}&pageSize=20`);
        allData = [...allData, ...res.data];
        totalPages = res.metadata?.total_pages || 1;
        page++;
      } while (page <= totalPages);

      const ids = [...new Set(allData.map(habitat => habitat.habitat_id))];
      setHabitatsId(ids);
    } catch (error) {
      Swal.fire('Error', 'Failed to load all habitat IDs.', 'error');
    }
  }

  /**
  * Loads species data for a specific habitat ID with optional pagination parameters.
  *
  * @async
  * @function
  * @param {string} habitatId - The habitat ID to filter by.
  * @param {number} [pg=page] - The page number to fetch.
  * @param {number} [size=pageSize] - The number of records per page.
  * @returns {Promise<void>}
  * @author `NatBitton54`
  */
  const loadSubCollection = async (habitatId, pg = page, size = pageSize) => {
    try {
      const endPoint = `/habitats/${habitatId}/species?page=${pg}&pageSize=${size}`;
      const res = await api.get(endPoint);
      const data = res.data || [];

      setSpeciesList(data);
      setTotalPages(res.metadata?.total_pages || 1);
      setPage(pg);
      setPageSize(size);
    } catch (error) {
      Swal.fire('Error', 'Failed to load sub collection.', 'error');
    }
  }

  /**
 * Handles habitat ID dropdown changes and triggers a fresh species fetch.
 *
 * @function
 * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event from select input.
 * @returns {void}
 * @author `NatBitton54`
 */
  const handleHabitatChange = (e) => {
    const habitatId = e.target.value;
    setSelectedHabitatId(habitatId);
    if (habitatId) {
      loadSubCollection(habitatId, 1, pageSize);
    } else {
      loadSubCollection([]);
    }
  }

  /**
  * Handles pagination page change triggered from Pagination component.
  *
  * @function
  * @param {number} newPage - The page number to navigate to.
  * @returns {void}
  * @author `NatBitton54`
  */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadSubCollection(selectedHabitatId, newPage, pageSize);
  };

  /**
  * Handles user changing the page size and resets to page 1.
  *
  * @function
  * @param {number} newSize - New number of items to show per page.
  * @returns {void}
  * @author `NatBitton54`
  */
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
    loadSubCollection(selectedHabitatId, 1, newSize);
  };

  return (
    <div className='container-'>
      <div className="full-width-header">
        <h4>/species-api/habitats/{selectedHabitatId || '[Select ID]'}/species</h4>
      </div>

      <div className="dropdown-wrapper">
        <div className="contain">
          <label htmlFor="habitatSelect" id="id-chosen">Select Habitat ID:</label>
          <select
            id="habitatSelect"
            className='form-select'
            value={selectedHabitatId}
            onChange={handleHabitatChange}
          >
            <option value="">-- Choose Habitat ID --</option>
            {habitatsId.map((id, i) => (
              <option key={i} value={id}>{id}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedHabitatId && speciesList.length > 0 && (
        <>
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
                {speciesList.length === 0 ? (
                  <tr>
                    <td colSpan={23} className='text center text-muted py-3'>
                      No species found for this habitat.
                    </td>
                  </tr>
                ) : (
                  speciesList.map((species, i) => (
                    <tr key={i}>
                      <td>{species.id}</td>
                      <td>{species.common_name}</td>
                      <td>{species.description}</td>
                      <td>{species.name_of_offspring}</td>
                      <td>{species.group_behaviour}</td>
                      <td>{species.gestation_period}</td>
                      <td>{species.breeding_season}</td>
                      <td>{species.number_of_offspring}</td>
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
                  )))}
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
        </>
      )}

      <div style={{ marginTop: '50px' }} />
    </div>
  );
};

export default SubCollection;
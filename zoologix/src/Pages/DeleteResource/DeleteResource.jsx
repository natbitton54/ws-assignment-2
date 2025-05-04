import React, { useEffect, useState } from 'react';
import './delete-resource.css';
import { FetchWrapper } from '../../utils/fetchWrapper.js';
import Swal from 'sweetalert2';

const api = new FetchWrapper('http://localhost/species-api');

/**
 * DeleteResource Component
 *
 * Allows the user to select a resource type (habitats or species),
 * dynamically fetch all IDs for that resource, and delete a selected one.
 * Client-side validation checks the ID format before deletion.
 * Confirmation is required before deletion. Alerts show for success or failure.
 *
 * @component
 * @returns {JSX.Element} The rendered delete resource interface.
 * 
 * @author `NatBitton54`
 */
function DeleteResource() {
  const [resourceType, setResourceType] = useState('habitats');
  const [resourceId, setResourceId] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  /**
 * useEffect - Triggers ID fetch when the selected resource type changes.
 *
 * React hook that runs `fetchIds` every time `resourceType` updates.
 */
  useEffect(() => {
    fetchIds();
  }, [resourceType]);

  /**
 * fetchIds
 *
 * Fetches all available resource IDs for the selected resource type (habitats or species).
 * Handles paginated data and stores all IDs in state.
 * Resets the currently selected ID afterward.
 *
 * @async
 * @function
 * @returns {Promise<void>}
 * @author `NatBitton54`
 */
  const fetchIds = async () => {
    try {
      let allIds = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await api.get(`/${resourceType}?page=${page}&pageSize=20`);
        const ids = res.data.map(item =>
          resourceType === 'habitats' ? item.habitat_id : item.species_id
        );
        allIds = [...allIds, ...ids];
        totalPages = res.metadata?.total_pages || 1;
        page++;
      } while (page <= totalPages);

      setResourceId(allIds);
      setSelectedId('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Could not load ${resourceType} IDs`,
      });
    }
  };

  /**
  * isValidIdFormat
  *
  * Checks if the provided ID matches the expected format based on resource type.
  *
  * @function
  * @param {string} id - The ID to validate.
  * @returns {boolean} `true` if the ID matches the format (HA-### or SP-###), `false` otherwise.
  * @author `NatBitton54`
  */
  const isValidIdFormat = (id) => {
    const pattern = resourceType === 'habitats' ? /^HA-\d{3}$/ : /^SP-\d{3}$/;
    return pattern.test(id);
  };

  /**
   * handleDelete
   *
   * Validates selected ID and prompts the user for confirmation before deletion.
   * Sends DELETE request to the API and shows an alert on success or failure.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   * @author `NatBitton54`
   */
  const handleDelete = async () => {
    if (!selectedId) {
      return Swal.fire('Error', 'Please select an ID to delete.', 'warning');
    }

    if (!isValidIdFormat(selectedId)) {
      return Swal.fire(
        'Invalid ID Format',
        `The ID must match ${resourceType === 'habitats' ? 'HA-###' : 'SP-###'
        } format.`,
        'error'
      );
    }

    const confirmDelete = await Swal.fire({
      title: `Delete ${resourceType}?`,
      text: `Are you sure you want to delete ${resourceType} with ID: ${selectedId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirmDelete.isConfirmed) return;

    const payload =
      resourceType === 'habitats'
        ? [{ habitat_id: selectedId }]
        : [{ species_id: selectedId }];

    try {
      await api.delete(`/${resourceType}`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${resourceType} with ID: ${selectedId} has been deleted.`,
      });
      fetchIds(); // Refresh dropdown
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Could not delete ${resourceType}. ${err.message || ''}`,
      });
    }
  };

  return (
    <>
      <div className="delete-contain">
        <div className="full-width-header">
          <h4>Delete a {resourceType === 'habitats' ? 'Habitat' : 'Species'}</h4>
        </div>
      </div>
      <div className="delete-container">
        <div className="form-group">
          <label>Select Resource Type:</label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          >
            <option value="habitats">Habitats</option>
            <option value="species">Species</option>
          </select>
        </div>

        <div className="form-group">
          <label>Select ID to Delete:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Choose an ID --</option>
            {resourceId.map((id, i) => (
              <option key={i} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </>
  );
}

export default DeleteResource;

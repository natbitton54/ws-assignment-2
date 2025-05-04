import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FetchWrapper } from '../../utils/fetchWrapper';
import './create-resource.css';

const api = new FetchWrapper('http://localhost/species-api');

/**
 * CreateResource Component
 *
 * This component allows users to create new Habitat or Species records.
 * - Dynamically renders input fields based on the selected resource type.
 * - For species, it fetches all foreign key dropdown values (diets, habitats, classifications).
 * - Includes client-side validation and SweetAlert for success/error feedback.
 *
 * @component
 * @returns {JSX.Element} Rendered create form for habitat or species.
 * 
 * @author `NatBitton54`
 */
const CreateResource = () => {
  const [resourceType, setResourceType] = useState('habitat');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [dietsIds, setDietsIds] = useState([]);
  const [habitatIds, setHabitatIds] = useState([]);
  const [classificationIds, setClassificationIds] = useState([]);

  const habitatFields = [
    { name: 'habitat_id', label: 'Habitat ID' },
    { name: 'name', label: 'Name' },
    { name: 'climate', label: 'Climate' },
    { name: 'location', label: 'Location' },
    { name: 'long_range', label: 'Longitude Range' },
    { name: 'lat_range', label: 'Latitude Range' },
    { name: 'description', label: 'Description' }
  ];

  const speciesFields = [
    { name: 'species_id', label: 'Species ID' },
    { name: 'common_name', label: 'Common Name' },
    { name: 'description', label: 'Description' },
    { name: 'name_of_offspring', label: 'Name of Offspring' },
    { name: 'group_behaviour', label: 'Group Behaviour' },
    { name: 'gestation_period', label: 'Gestation Period' },
    { name: 'breeding_season', label: 'Breeding Season' },
    { name: 'num_of_offspring', label: 'Number of Offspring' },
    { name: 'average_lifespan', label: 'Average Lifespan' },
    { name: 'diet_id', label: 'Diet ID', dropdown: dietsIds },
    { name: 'habitat_id', label: 'Habitat ID', dropdown: habitatIds },
    { name: 'classification_id', label: 'Classification ID', dropdown: classificationIds }
  ];

  const fields = resourceType === 'habitat' ? habitatFields : speciesFields;

  /**
   * useEffect - Fetch dropdown data when resource type is 'species'
  */
  useEffect(() => {
    if (resourceType === 'species') fetchDropdownData();
  }, [resourceType]);

  /**
   * fetchDropdownData
   *
   * Fetches all foreign key dropdown values for species form:
   * - Diet IDs
   * - Habitat IDs
   * - Classification IDs
   *
   * @async
   * @function
   * @returns {Promise<void>}
   * @author `NatBitton54`
   */
  const fetchDropdownData = async () => {
    try {
      const fetchAllIds = async (endpoint) => {
        let all = [];
        let page = 1;
        let totalPages = 1;

        do {
          const res = await api.get(`${endpoint}?page=${page}&pageSize=20`);
          all = [...all, ...res.data];
          totalPages = res.metadata?.total_pages || 1;
          page++;
        } while (page <= totalPages);

        return all;
      };

      const [diets, habitats, classifications] = await Promise.all([
        fetchAllIds('/diets'),
        fetchAllIds('/habitats'),
        fetchAllIds('/classifications')
      ]);

      setDietsIds(diets.map(d => d.diet_id));
      setHabitatIds(habitats.map(h => h.habitat_id));
      setClassificationIds(classifications.map(c => c.classification_id));
    } catch {
      Swal.fire('Error', 'Failed to load dropdown options (foreign keys).', 'error');
    }
  };

  /**
   * handleInputChange
   *
   * Updates the formData state based on user input.
   * Applies formatting rules to specific fields.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e
   * @author `NatBitton54`
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (['num_of_offspring', 'average_lifespan'].includes(name)) {
      processedValue = value.replace(/\D/g, '');
    } else if (['habitat_id', 'species_id'].includes(name)) {
      processedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: processedValue });
    setErrors({ ...errors, [name]: '' });
  };

  /**
   * validate
   *
   * Validates the current form data based on field-specific rules.
   * Updates error messages if any field is invalid.
   *
   * @function
   * @returns {boolean} True if all fields are valid; false otherwise.
   * @author `NatBitton54`
   */
  const validate = () => {
    const newErrors = {};
    fields.forEach(({ name }) => {
      const value = formData[name]?.toString().trim() || '';

      if (!value) {
        newErrors[name] = 'This field is required';
        return;
      }

      switch (name) {
        case 'habitat_id':
          if (!/^HA-\d{3}$/i.test(value)) newErrors[name] = 'Habitat ID must be in the format HA-###';
          break;
        case 'name':
          if (value.length < 1) newErrors[name] = 'Name must not be empty';
          break;
        case 'climate':
          if (!/^[A-Za-z]+$/.test(value)) newErrors[name] = 'Climate must contain only letters';
          break;
        case 'long_range':
          if (!/^\d+[EW] to \d+[EW]$/i.test(value)) newErrors[name] = 'Longitude range must be like "30E to 45W"';
          break;
        case 'lat_range':
          if (!/^\d+[NS] to \d+[NS]$/i.test(value)) newErrors[name] = 'Latitude range must be like "20N to 40S"';
          break;
        case 'description':
          if (value.length < 10) newErrors[name] = 'Description must be at least 10 characters long';
          break;

        case 'species_id':
          if (!/^SP-\d{3}$/i.test(value)) newErrors[name] = 'Species ID must be in the format SP-###';
          break;
        case 'common_name':
          if (value.length < 1 || value.length > 255) newErrors[name] = 'Common name must be 1–255 characters long';
          break;
        case 'name_of_offspring':
          if (value.length > 255) newErrors[name] = 'Name of offspring must be 255 characters max';
          break;
        case 'group_behaviour':
          if (value.length > 32) newErrors[name] = 'Group behaviour must be 32 characters max';
          break;
        case 'gestation_period':
          if (value.length > 32) newErrors[name] = 'Gestation period must be 32 characters max';
          break;
        case 'breeding_season':
          if (value.length > 16) newErrors[name] = 'Breeding season must be 16 characters max';
          break;
        case 'num_of_offspring':
        case 'average_lifespan':
          if (!/^\d+$/.test(value)) newErrors[name] = 'Must be an integer';
          break;
        case 'diet_id':
          if (!/^DI-\d{3}$/i.test(value)) newErrors[name] = 'Diet ID must be in the format DI-###';
          break;
        case 'classification_id':
          if (!/^CL-\d{3}$/i.test(value)) newErrors[name] = 'Classification ID must be in the format CL-###';
          break;
        default:
          break;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit
   *
   * Handles form submission:
   * - Validates input.
   * - Sends a POST request to the API with form data.
   * - Displays success or error alerts using SweetAlert.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   *  @author `NatBitton54`
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const endpoint = resourceType === 'habitat' ? '/habitats' : '/species';
      const parsedData = { ...formData };

      if (resourceType === 'species') {
        parsedData.num_of_offspring = parseInt(parsedData.num_of_offspring, 10);
        parsedData.average_lifespan = parseInt(parsedData.average_lifespan, 10);
      }

      await api.post(endpoint, [parsedData]);

      Swal.fire('Success', `${resourceType} created successfully!`, 'success');
      setFormData({});
    } catch (err) {
      const code = err?.details?.code;
      const duplicateId = err?.details?.id;

      if (code === 23000) {
        Swal.fire(
          'Duplicate ID',
          `A record with ID "${duplicateId}" already exists.`,
          'warning'
        );
      } else {
        Swal.fire(
          'Error',
          err?.message || 'Something went wrong.',
          'error'
        );
      }
    }
  };

  return (
    <div className="contain-create">
      <div className="full-width-header">
        <h4>Create a New {resourceType === 'habitat' ? 'Habitat' : 'Species'}</h4>
      </div>

      <div className="create-container">
        <select
          className="form-select"
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setFormData({});
            setErrors({});
          }}
        >
          <option value="habitat">Habitat</option>
          <option value="species">Species</option>
        </select>

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, dropdown }) => (
            <div key={name} className="form-group">
              <label>{label}</label>
              {dropdown ? (
                <select
                  name={name}
                  value={formData[name] || ''}
                  onChange={handleInputChange}
                  className={`form-select ${errors[name] ? 'invalid' : ''}`}
                >
                  <option value="">-- Select {label} --</option>
                  {dropdown.map((val, i) => (
                    <option key={i} value={val}>{val}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name={name}
                  value={formData[name] || ''}
                  onChange={handleInputChange}
                  className={errors[name] ? 'invalid' : ''}
                />
              )}
              {errors[name] && <span className="error-text">{errors[name]}</span>}
            </div>
          ))}
          <button type="submit" className="submit-btn">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateResource;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import carService from '../services/carService';
// 1. Import our validation utility
import { validateCarForm } from '../utilities/validation';
import '../App.css';


const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    base_price: '',
    description: '',
    image_url: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2. Add the state object to hold validation errors.
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        const car = await carService.getById(id);
        setFormData(car);
      } catch (err) {
        setErrors({ load: 'Could not load car data for editing.' });
      } finally {
        setLoading(false);
      }
    };
    fetchCarData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // 3. Validate the form data before submitting the update.
    const validationErrors = validateCarForm(formData);
    setErrors(validationErrors);

    // 4. If there are validation errors, stop the update process.
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await carService.update(id, formData);
      navigate(`/customcars/${id}`);
    } catch (err) {
      console.error('Error updating car:', err);
      setErrors({ api: err.response?.data?.error || 'Failed to update car.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this car?')) {
      try {
        await carService.delete(id);
        navigate('/');
      } catch (err) {
        setErrors({ api: err.response?.data?.error || 'Failed to delete car.' });
      }
    }
  };

  if (loading) return <div>Loading Form...</div>;
  if (errors.load) return <div className="error-message">{errors.load}</div>;

  return (
    <div className="form-container">
      <Link to={`/customcars/${id}`}>← Back to Car Details</Link>
      <h1>Edit {formData.name}</h1>

      <form onSubmit={handleUpdate} className="car-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Model Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          {/* 5. Conditionally render the error message for this field */}
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="year">Year:</label>
          <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} />
          {errors.year && <p className="error-message">{errors.year}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="base_price">Base Price:</label>
          <input type="number" id="base_price" name="base_price" step="0.01" value={formData.base_price} onChange={handleChange} />
          {errors.base_price && <p className="error-message">{errors.base_price}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="image_url">Image URL:</label>
          <input type="text" id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} />
        </div>
        
        {errors.api && <p className="error-message">{errors.api}</p>}
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="delete-section">
        <h2>Delete Car</h2>
        <p>This action is permanent and cannot be undone.</p>
        <button onClick={handleDelete} className="delete-button">Delete This Car</button>
      </div>
    </div>
  );
};

export default EditCar;
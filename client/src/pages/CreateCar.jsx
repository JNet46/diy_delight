import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import carService from '../services/carService';
// 1. Import our new validation utility
import { validateCarForm } from '../utilities/validation';
import '../App.css';


const CreateCar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    base_price: '',
    description: '',
    image_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2. Add a new state object to hold validation errors for each field.
  //    An empty object `{}` signifies no errors.
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. Before making an API call, validate the form data.
    const validationErrors = validateCarForm(formData);
    setErrors(validationErrors);
    
    // 4. Check if the returned errors object has any keys. If it does, stop the submission.
    if (Object.keys(validationErrors).length > 0) {
      return; // The form is invalid, so we stop here.
    }

    // If we get past the check, the form is valid. Proceed with submission.
    setIsSubmitting(true);
    try {
      const newCar = await carService.create(formData);
      navigate(`/customcars/${newCar.id}`);
    } catch (err) {
      console.error('Error creating car:', err);
      // Store any errors from the API as well
      setErrors({ api: err.response?.data?.error || 'An unexpected API error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add a New Ferrari</h1>

      <form onSubmit={handleSubmit} className="car-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Model Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          {/* 5. Conditionally render the error message for this specific field */}
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

        {/* Display any general API errors */}
        {errors.api && <p className="error-message">{errors.api}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Car...' : 'Add Car'}
        </button>
      </form>
    </div>
  );
};

export default CreateCar;
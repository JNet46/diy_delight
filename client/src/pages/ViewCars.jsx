import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import carService from '../services/carService';
import { SavedCarsContext } from '../context/SavedCarsContext';
import '../App.css';


const ViewCars = () => {
    // --- HOOKS INITIALIZATION ---
    
    // The `useContext` hook connects this component to the SavedCarsContext. It returns the `value`
    // from the Provider. We destructure all the pieces we need: the `savedCars` array to display,
    // and the `deleteCarFromGarage` and `deleteOptionFromCar` functions to provide interactivity.
    const { savedCars, deleteCarFromGarage, deleteOptionFromCar } = useContext(SavedCarsContext);
    console.log("ViewCars is rendering. Number of saved cars:", savedCars.length, savedCars);
  
    // --- LOCAL STATE MANAGEMENT ---
    // This state is specific to this component for fetching the base models from the database.
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    // --- SIDE EFFECTS (useEffect) ---
    // This effect runs once when the component is first mounted to fetch the list of base models.
    useEffect(() => {
      const fetchCars = async () => {
        try {
          setLoading(true);
          const data = await carService.getAll();
          setCars(data);
        } catch (err) {
          console.error('Error fetching cars:', err);
          setError('Failed to load cars from the showroom. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchCars();
    }, []); // The empty dependency array `[]` tells React to only run this effect once.
  
  
    // --- EVENT HANDLERS ---
  
    // This function is called when the "Delete" button for a BASE MODEL is clicked.
    const handleDeleteBaseModel = async (id) => {
      if (window.confirm('Are you sure you want to permanently delete this base model from the database?')) {
        try {
          await carService.delete(id);
          setCars(cars.filter((car) => car.id !== id));
        } catch (err) {
          console.error('Error deleting car:', err);
          setError('Failed to delete the base model.');
        }
      }
    };
  
    // This function is called when the "Delete Build" button for a SAVED CONFIGURATION is clicked.
    const handleDeleteConfiguration = (garageId) => {
      if (window.confirm("Are you sure you want to delete this entire saved configuration?")) {
        // It calls the function from our global context to perform the deletion.
        deleteCarFromGarage(garageId);
      }
    };
  
    // This function is called when the 'X' button next to a SAVED OPTION is clicked.
    const handleDeleteOption = (garageId, optionId) => {
      // This action is small and easily reversible by re-adding the option, so no confirmation is needed.
      // It calls the function from our global context, passing the necessary IDs.
      deleteOptionFromCar(garageId, optionId);
    };
  
  
    // --- RENDER LOGIC ---
  
    if (loading) return <div>Loading Showroom...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
  
    return (
      <div className="view-cars-container">
        <header className="page-header">
          <h1>Ferrari Models Showroom</h1>
        </header>
  
        {/* This section for the base models fetched from the API remains largely the same. */}
        <ul className="car-list">
          {cars.map((car) => (
            <li key={car.id} className="car-item">
              <div className="car-info">
                <Link to={`/customcars/${car.id}`} className="car-name-link">
                  {car.name} ({car.year})
                </Link>
                <p className="car-price">
                  Base Price: ${new Intl.NumberFormat().format(car.base_price)}
                </p>
              </div>
              <div className="car-actions">
                <Link to={`/edit/${car.id}`} className="button-edit">Edit</Link>
                <button onClick={() => handleDeleteBaseModel(car.id)} className="button-delete">Delete</button>
              </div>
            </li>
          ))}
        </ul>
        
        {/* ========================================================== */}
        {/*  NEW SECTION: Saved Configurations Table                  */}
        {/* ========================================================== */}
        {/* This entire block is conditionally rendered and only appears if there are saved cars. */}
        {savedCars.length > 0 && (
          <div className="saved-cars-section">
            <h2>My Saved Configurations</h2>
            <table className="saved-cars-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Selected Options</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* We map over the `savedCars` array from the global context. */}
                {savedCars.map((savedCar) => (
                  <tr key={savedCar.garageId}>
                    {/* Column 1: Model Name and Year */}
                    <td>
                      <strong>{savedCar.baseCar.name}</strong>
                      <div className="subtext">({savedCar.baseCar.year})</div>
                    </td>
  
                    {/* Column 2: List of Selected Options with individual "X" delete buttons */}
                    <td>
                      <ul className="options-list">
                        {savedCar.selectedOptions.length > 0 ? (
                          savedCar.selectedOptions.map(option => (
                            <li key={option.id}>
                              {option.option_name}
                              <button
                                className="delete-option-btn"
                                title={`Remove ${option.option_name}`}
                                onClick={() => handleDeleteOption(savedCar.garageId, option.id)}
                              >
                                &times; {/* This is the HTML entity for the 'X' symbol */}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="no-options">No custom options selected.</li>
                        )}
                      </ul>
                    </td>
  
                    {/* Column 3: The dynamically updated Total Price */}
                    <td>
                      <strong>${new Intl.NumberFormat().format(savedCar.totalPrice)}</strong>
                    </td>
  
                    {/* Column 4: Action to delete the entire build */}
                    <td>
                      <button
                        className="button-delete"
                        onClick={() => handleDeleteConfiguration(savedCar.garageId)}
                      >
                        Delete Build
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  export default ViewCars;
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SavedCarsContext } from '../context/SavedCarsContext';
import { calculateTotalPrice } from '../utilities/calcprice';
import { validateCombination } from '../utilities/validation';
import carService from '../services/carService';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { tabConfig } from '../config/tabConfig';

// A simple style object for layout, can be moved to a CSS file
const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    margin: '1.5rem 0',
  },
  button: {
    textDecoration: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    border: '1px solid #007bff',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '1rem',
    textDecoration: 'none',
    color: '#007bff',
  }
};

const CarDetails = () => {
    // --- HOOKS INITIALIZATION ---
    const navigate = useNavigate();
    const { id } = useParams();
    const { addCarToGarage } = useContext(SavedCarsContext);
    console.log("In CarDetails, received from context:", { addCarToGarage });
  
    // --- STATE MANAGEMENT ---
    // Here we define every piece of data that can change over time.
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [validationError, setValidationError] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);
    const [hoveredItem, setHoveredItem] = useState(null);
  
  
    // --- PERFORMANCE OPTIMIZATION (useMemo) ---
    // This memoized calculation prevents the component from re-sorting the customization options on every single render.
    const groupedOptions = useMemo(() => {
      if (!car?.available_customizations) return {};
      return car.available_customizations.reduce((accumulator, option) => {
        const category = option.category;
        if (!accumulator[category]) accumulator[category] = [];
        accumulator[category].push(option);
        return accumulator;
      }, {});
    }, [car]);
  
  
    // --- SIDE EFFECTS (useEffect) ---
    // Effect 1: Fetching the initial car data.
    useEffect(() => {
      const fetchCarDetails = async () => {
        try {
          setLoading(true);
          const data = await carService.getById(id);
          setCar(data);
          setTotalPrice(data.base_price);
        } catch (err) {
          setError('Car not found or an error occurred while fetching data.');
        } finally {
          setLoading(false);
        }
      };
      fetchCarDetails();
    }, [id]);
  
    // Effect 2: Re-running calculations whenever the user's selections change.
    useEffect(() => {
      if (!car) return;
      const validationResult = validateCombination(selectedOptions);
      setValidationError(validationResult.isValid ? null : validationResult.message);
      const newTotalPrice = calculateTotalPrice(parseFloat(car.base_price), selectedOptions);
      setTotalPrice(newTotalPrice);
    }, [selectedOptions, car]);
  
  
    // --- EVENT HANDLERS ---
    // These are the functions that respond to user actions.
  
    // Toggles an option in the `selectedOptions` state array.
    const handleOptionToggle = (option) => {
      setSelectedOptions((prevSelected) =>
        prevSelected.some(item => item.id === option.id)
          ? prevSelected.filter(item => item.id !== option.id)
          : [...prevSelected, option]
      );
    };
    
    // Handles the "Apply" button click, validating and saving the configuration.
    const handleApplyChanges = () => {
      if (validationError) {
        window.alert(`Cannot apply changes. Please resolve the following warning:\n\n"${validationError}"`);
        return;
      }
      const configuredCar = {
        baseCar: car,
        selectedOptions: selectedOptions,
        totalPrice: totalPrice,
      };
      console.log("Attempting to call addCarToGarage with:", configuredCar);
      
      addCarToGarage(configuredCar);
      window.alert(`Configuration for "${car.name}" has been saved successfully!`);
      navigate('/');
    };
    
    // --- THIS IS THE FIX ---
    // This function was previously missing, causing the "is not defined" error.
    // It is called by the `<Tabs>` component whenever the user clicks on a new tab.
    // Its purpose is to update our `tabIndex` state and, crucially, to reset the
    // `hoveredItem` state. This prevents a tooltip from a previous tab from "sticking"
    // when the user navigates to a new tab.
    const handleTabSelect = (index) => {
      setTabIndex(index);
      setHoveredItem(null);
    };
  
  
    // --- RENDER LOGIC ---
  
    // First, handle the loading and error states.
    if (loading) return <div>Loading Customizer...</div>;
    if (error) return <div>Error: {error}</div>;
  
    return (
      <div className="car-details-container">
        <Link to="/">← Back to Showroom</Link>
        <div className="details-header">
          <h1>{car.name} ({car.year})</h1>
        </div>
        <hr />
        
        <h2>Customize Your Car</h2>
        
        {/* The onSelect prop now correctly points to our defined handleTabSelect function. */}
        <Tabs className="customizer-tabs" selectedIndex={tabIndex} onSelect={handleTabSelect}>
          <TabList>
            {tabConfig.map(tab => <Tab key={tab.id}>{tab.title}</Tab>)}
          </TabList>
  
          {tabConfig.map(tab => (
            <TabPanel key={tab.id}>
              <div className="tab-content-layout">
                <div className="image-hotspot-container">
                  {/* The main category image is static to prevent flickering. */}
                  <img src={tab.imageUrl} alt={`${tab.title} Preview`} className="tab-image" />
                  
                  {/* We map over the hotspots defined in our config and render them as invisible overlays. */}
                  {tab.hotspots.map(hotspot => (
                    <div
                      key={hotspot.id}
                      className="hotspot"
                      style={{ top: hotspot.top, left: hotspot.left, width: hotspot.width, height: hotspot.height }}
                      onMouseEnter={() => setHoveredItem(hotspot)}
                      onMouseLeave={() => setHoveredItem(null)}
                    ></div>
                  ))}
                </div>
  
                <div className="tab-options-container">
                  {/* This information box dynamically shows the name of the hovered hotspot. */}
                  <div className="hover-info-box">
                    {hoveredItem ? (
                      <>
                        <h3>{hoveredItem.name}</h3>
                        <p>Select an option from the list below.</p>
                      </>
                    ) : (
                      <h3>{tab.title} Options</h3>
                    )}
                  </div>
                  
                  {/* We render the list of options from our performant, memoized `groupedOptions` object. */}
                  {(groupedOptions[tab.categoryName] || []).map(option => (
                    <div key={option.id} className="customization-option">
                      <input
                        type="checkbox"
                        id={`option-${option.id}`}
                        onChange={() => handleOptionToggle(option)}
                        checked={selectedOptions.some(item => item.id === option.id)}
                      />
                      <label htmlFor={`option-${option.id}`}>
                        {option.option_name}
                        <span className="price-adjustment">
                          (+${new Intl.NumberFormat().format(option.price_adjustment)})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>
          ))}
        </Tabs>
        
        <hr />
        
        <div className="price-summary">
          {validationError && <p className="validation-error"><strong>Warning:</strong> {validationError}</p>}
          <h3>Base Price: ${new Intl.NumberFormat().format(car.base_price)}</h3>
          <h3>Options Total: ${new Intl.NumberFormat().format(totalPrice - parseFloat(car.base_price))}</h3>
          <h2>Total Price: ${new Intl.NumberFormat().format(totalPrice)}</h2>
          <button className="apply-button" onClick={handleApplyChanges}>
            Apply Customizations
          </button>
        </div>
      </div>
    );
  };
  
  export default CarDetails;
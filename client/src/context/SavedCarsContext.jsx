// ==========================================================
//  IMPORTS
// ==========================================================
// We begin by importing all the necessary tools and functions.

// React and its core hooks.
// - createContext: The function that creates the context object itself.
// - useState: For managing the `savedCars` array state.
// - useEffect: For handling the side effect of saving to localStorage.
// - useCallback: A crucial optimization hook to memoize (remember) functions, preventing them from being re-created on every render.
// - useMemo: An optimization hook to memoize the `value` object, ensuring consumers only re-render when the data they need actually changes.
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

// We need our price calculation utility within the context to recalculate prices when options are deleted.
import { calculateTotalPrice } from '../utilities/calcprice';


// ==========================================================
//  SETUP
// ==========================================================

// Define a constant for the localStorage key. This prevents typos and makes it easy to change.
const SAVED_CARS_STORAGE_KEY = 'ferrariConfigurator.savedCars';

// Create the context object. This is what components will import to connect to this context.
export const SavedCarsContext = createContext();


// ==========================================================
//  PROVIDER COMPONENT DEFINITION
// ==========================================================
// The Provider is a component that will wrap a part of our application (in our case, the entire app).
// It holds the state and the logic, and "provides" them to all descendants.

export const SavedCarsProvider = ({ children }) => {
  // --- STATE MANAGEMENT ---

  // We initialize the state by providing a function to `useState`. This function runs only once
  // on the initial render, making it the perfect place to load data from localStorage.
  const [savedCars, setSavedCars] = useState(() => {
    try {
      const storedCars = localStorage.getItem(SAVED_CARS_STORAGE_KEY);
      return storedCars ? JSON.parse(storedCars) : [];
    } catch (error) {
      console.error("Error reading from localStorage on initial load:", error);
      return [];
    }
  });


  // --- SIDE EFFECT FOR PERSISTENCE ---

  // This `useEffect` hook runs *after* every render where the `savedCars` state has changed.
  // Its job is to keep localStorage in sync with our application's state.
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_CARS_STORAGE_KEY, JSON.stringify(savedCars));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [savedCars]); // The dependency array: this effect only runs when `savedCars` changes.


  // --- CONTEXT API & ACTIONS ---
  // These are the functions that our components will call to interact with the state.
  // We wrap them in `useCallback` to ensure they have a stable identity across re-renders,
  // which is a key performance optimization.

  const addCarToGarage = useCallback((configuredCar) => {
    // We use the functional form of `setSavedCars` (`(prevCars) => ...`). This is the safest
    // way to update state that depends on the previous state, especially inside a `useCallback`.
    setSavedCars((prevCars) => {
      const newConfigFingerprint = configuredCar.selectedOptions.map(o => o.id).sort((a, b) => a - b).join(',');
      const isDuplicate = prevCars.some(existingCar => {
        if (existingCar.baseCar.id !== configuredCar.baseCar.id) return false;
        const existingConfigFingerprint = existingCar.selectedOptions.map(o => o.id).sort((a, b) => a - b).join(',');
        return newConfigFingerprint === existingConfigFingerprint;
      });

      if (isDuplicate) {
        window.alert("This exact configuration has already been saved to your garage.");
        return prevCars; // If it's a duplicate, we return the previous state unchanged.
      }

      const newSavedCar = { ...configuredCar, garageId: Date.now() };
      return [...prevCars, newSavedCar]; // Return the new array with the added car.
    });
  }, []); // Empty dependency array: this function itself never needs to be re-created.

  const deleteCarFromGarage = useCallback((garageIdToDelete) => {
    setSavedCars((prevCars) => prevCars.filter(car => car.garageId !== garageIdToDelete));
  }, []); // Empty dependency array.

  const deleteOptionFromCar = useCallback((garageId, optionIdToDelete) => {
    setSavedCars((prevCars) => prevCars.map(car => {
      if (car.garageId !== garageId) return car;
      const updatedOptions = car.selectedOptions.filter(option => option.id !== optionIdToDelete);
      const updatedPrice = calculateTotalPrice(parseFloat(car.baseCar.base_price), updatedOptions);
      return { ...car, selectedOptions: updatedOptions, totalPrice: updatedPrice };
    }));
  }, []); // Empty dependency array.
  
  const resetGarage = useCallback(() => {
    setSavedCars([]);
  }, []); // Empty dependency array.


  // --- VALUE MEMOIZATION ---
  // The `value` prop of the Provider is what gets passed down to all consuming components.
  // If we create this object directly in the return statement (`value={{...}}`), it will be a
  // new object on every single render, causing all consumers to re-render unnecessarily.
  // By wrapping it in `useMemo`, we ensure that this `value` object only changes when the data
  // inside it (`savedCars` or the functions) actually changes.
  const value = useMemo(() => ({
    savedCars,
    addCarToGarage,
    deleteCarFromGarage,
    deleteOptionFromCar,
    resetGarage
  }), [savedCars, addCarToGarage, deleteCarFromGarage, deleteOptionFromCar, resetGarage]);


  // --- RENDER LOGIC ---
  // The Provider component itself doesn't render any visible UI. It simply provides the `value`
  // to all of its children, which in our case is the entire <App /> component.
  return (
    <SavedCarsContext.Provider value={value}>
      {children}
    </SavedCarsContext.Provider>
  );
};
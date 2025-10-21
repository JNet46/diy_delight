// client/src/services/carService.js

import axios from 'axios';

// The base URL of your Express API.
// Make sure the port matches the one your server is running on (e.g., 3000 or 3001)
const API_URL = 'http://localhost:3000/api/cars';

/**
 * Fetches all cars from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of car objects.
 */
const getAllCars = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Fetches a single car by its ID.
 * @param {string|number} id The ID of the car to fetch.
 * @returns {Promise<Object>} A promise that resolves to the car object.
 */
const getCarById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Creates a new car.
 * @param {Object} carData The data for the new car.
 * @returns {Promise<Object>} A promise that resolves to the newly created car object.
 */
const createCar = async (carData) => {
  const response = await axios.post(API_URL, carData);
  return response.data;
};

/**
 * Updates an existing car by its ID.
 * @param {string|number} id The ID of the car to update.
 * @param {Object} carData The updated data for the car.
 * @returns {Promise<Object>} A promise that resolves to the updated car object.
 */
const updateCar = async (id, carData) => {
  const response = await axios.put(`${API_URL}/${id}`, carData);
  return response.data;
};

/**
 * Deletes a car by its ID.
 * @param {string|number} id The ID of the car to delete.
 * @returns {Promise<Object>} A promise that resolves to the deletion confirmation message.
 */
const deleteCar = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Export the functions as a single object or individually
const carService = {
  getAll: getAllCars,
  getById: getCarById,
  create: createCar,
  update: updateCar,
  delete: deleteCar,
};

export default carService;
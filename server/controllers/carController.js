// controllers/carController.js

import { pool } from '../config/database.js';

// --- (R)ead: Get all car models ---
// Responds to GET /api/cars
const getAllCars = async (req, res) => {
  try {
    const query = 'SELECT id, name, year, base_price, image_url FROM models ORDER BY name ASC;';
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all cars:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// --- (R)ead: Get a single car model by its ID ---
// Responds to GET /api/cars/:id
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const carQuery = 'SELECT * FROM models WHERE id = $1;';
    const carResult = await pool.query(carQuery, [id]);

    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: `Car with ID ${id} not found.` });
    }
    const car = carResult.rows[0];

    const customizationsQuery = `
      SELECT c.id, c.category, c.option_name, c.price_adjustment, c.image_url
      FROM customizations c
      JOIN model_customizations mc ON c.id = mc.customization_id
      WHERE mc.model_id = $1 ORDER BY c.category;
    `;
    const customizationsResult = await pool.query(customizationsQuery, [id]);
    car.available_customizations = customizationsResult.rows;

    res.status(200).json(car);
  } catch (error) {
    console.error(`Error fetching car with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// --- (C)reate: Add a new car model ---
// Responds to POST /api/cars
const createCar = async (req, res) => {
  try {
    const { name, year, base_price, description, image_url } = req.body;

    // Basic validation
    if (!name || !year || !base_price) {
      return res.status(400).json({ error: 'Name, year, and base_price are required fields.' });
    }

    const query = `
      INSERT INTO models (name, year, base_price, description, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, year, base_price, description, image_url];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]); // 201 Created
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// --- (U)pdate: Edit an existing car model by its ID ---
// Responds to PUT /api/cars/:id
const updateCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, base_price, description, image_url } = req.body;

    // Basic validation
    if (!name || !year || !base_price) {
      return res.status(400).json({ error: 'Name, year, and base_price are required fields.' });
    }

    const query = `
      UPDATE models
      SET name = $1, year = $2, base_price = $3, description = $4, image_url = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [name, year, base_price, description, image_url, id];
    const { rows, rowCount } = await pool.query(query, values);

    if (rowCount === 0) {
      return res.status(404).json({ error: `Car with ID ${id} not found.` });
    }

    res.status(200).json(rows[0]); // 200 OK
  } catch (error) {
    console.error(`Error updating car with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// --- (D)elete: Remove a car model by its ID ---
// Responds to DELETE /api/cars/:id
const deleteCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM models WHERE id = $1;';
    const { rowCount } = await pool.query(query, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: `Car with ID ${id} not found.` });
    }

    res.status(200).json({ message: `Successfully deleted car with ID ${id}.` });
  } catch (error) {
    console.error(`Error deleting car with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// Export all controller functions
export {
  getAllCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById,
};
// routes/carRoutes.js

import express from 'express';
// Import ALL the new functions from the controller
import {
  getAllCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById,
} from '../controllers/carController.js';

const router = express.Router();

// Route for getting all cars and creating a new car
router.route('/')
  .get(getAllCars)
  .post(createCar);

// Route for getting, updating, and deleting a single car by its ID
router.route('/:id')
  .get(getCarById)
  .put(updateCarById)
  .delete(deleteCarById);

export default router;
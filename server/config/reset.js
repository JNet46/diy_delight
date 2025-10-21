// config/reset.js

// This script is designed to be run from the command line (e.g., `npm run db:reset`).
// Its purpose is to completely wipe and recreate the database, ensuring a clean, predictable
// state for development and testing.

import { pool } from './database.js'; // Import the connection pool from our database configuration.

/**
 * An asynchronous function that connects to the database and executes a series of SQL commands
 * to reset the tables and seed them with initial data.
 */
async function resetDatabase() {
  console.log('--- Starting database reset ---');
  // We get a single client from the pool to run all our commands. This is more efficient
  // and necessary for running a transaction.
  const client = await pool.connect();

  try {
    // A TRANSACTION ensures that all commands within it either succeed together or fail together.
    // If any command fails, the ROLLBACK at the end will undo all previous changes.
    await client.query('BEGIN');

    // --- 1. Drop Existing Tables ---
    // We drop tables in the reverse order of creation to avoid errors related to foreign key constraints.
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS model_customizations;
      DROP TABLE IF EXISTS customizations;
      DROP TABLE IF EXISTS models;
    `);

    // --- 2. Create New Tables ---
    // Here we define the "schema" or structure of our database.
    console.log('Creating new tables...');
    
    // The `models` table stores the base information for each car.
    await client.query(`
      CREATE TABLE models (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        base_price DECIMAL(12, 2) NOT NULL,
        description TEXT,
        image_url VARCHAR(255)
      );
    `);
    
    // The `customizations` table stores every possible option.
    await client.query(`
      CREATE TABLE customizations (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        option_name VARCHAR(100) NOT NULL,
        price_adjustment DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255)
      );
    `);

    // The `model_customizations` is a "join" table that links models to customizations.
    await client.query(`
      CREATE TABLE model_customizations (
        model_id INT REFERENCES models(id) ON DELETE CASCADE,
        customization_id INT REFERENCES customizations(id) ON DELETE CASCADE,
        PRIMARY KEY (model_id, customization_id)
      );
    `);
    console.log('Tables created successfully!');

    // --- 3. Seed the Tables with Initial Data ---
    // "Seeding" means populating the database with starting data.
    console.log('Seeding database with initial data...');
    await client.query(`
      INSERT INTO models (name, year, base_price, description, image_url) VALUES
      ('Ferrari 296 GTB', 2023, 322986.00, 'The new V6 hybrid marvel, defining driving pleasure.', 'https://example.com/296gtb.jpg'),
      ('Ferrari F8 Tributo', 2022, 280000.00, 'A celebration of excellence and an homage to the most powerful V8 in Ferrari history.', 'https://example.com/f8tributo.jpg'),
      ('Ferrari 812 Superfast', 2021, 335000.00, 'The fastest and most powerful road-going Ferrari ever built.', 'https://example.com/812superfast.jpg');
    `);
    await client.query(`
      INSERT INTO customizations (category, option_name, price_adjustment, image_url) VALUES
      ('Exterior Color', 'Rosso Corsa', 5000.00, 'https://i.imgur.com/8f7v3j2.png'),           -- ID: 1
      ('Exterior Color', 'Giallo Modena', 7000.00, 'https://i.imgur.com/O3k4bS1.png'),          -- ID: 2
      ('Exterior Color', 'Nero Daytona', 12450.00, 'https://i.imgur.com/2m3Xv5b.png'),       -- ID: 3
      ('Exterior Color', 'Blu Tour de France', 15450.00, 'https://i.imgur.com/gK5t4Y8.png'), -- ID: 4
      ('Wheel Style', 'Standard Forged Wheels', 3000.00, 'https://i.imgur.com/s6aV1Yd.png'),      -- ID: 5
      ('Wheel Style', 'Diamond-Forged Wheels', 8100.00, 'https://i.imgur.com/bX9f8J1.png'),   -- ID: 6
      ('Wheel Style', 'Carbon Fibre Wheels', 25000.00, 'https://i.imgur.com/pY7q2Nf.png'),   -- ID: 7
      ('Interior Trim', 'Standard Leather (Black)', 1500.00, 'https://i.imgur.com/k3jO1hS.png'),  -- ID: 8
      ('Interior Trim', 'Alcantara Interior (Charcoal)', 5900.00, 'https://i.imgur.com/rV7g8E2.png'), -- ID: 9
      ('Interior Trim', 'Carbon Fibre Driver Zone', 7500.00, 'https://i.imgur.com/aI8b9c1.png');   -- ID: 10
    `);

    // --- THIS IS THE KEY UPDATED SECTION ---
    // This statement now comprehensively links every customization option (IDs 1-10)
    // to every car model (IDs 1-3), ensuring all options appear for all cars.
    await client.query(`
      INSERT INTO model_customizations (model_id, customization_id) VALUES
      -- Links for Ferrari 296 GTB (Model ID 1)
      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
      
      -- Links for Ferrari F8 Tributo (Model ID 2)
      (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),

      -- Links for Ferrari 812 Superfast (Model ID 3)
      (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10);
    `);
    console.log('Database seeded successfully!');

    // If all commands were successful, we COMMIT the transaction, making all changes permanent.
    await client.query('COMMIT');
    console.log('Transaction committed.');

  } catch (error) {
    // If any command failed, we ROLLBACK the transaction, undoing all changes.
    await client.query('ROLLBACK');
    console.error('Error during database reset. Transaction was rolled back.', error);
    throw error; // Exit with a failure code.
  } finally {
    // This block runs no matter what.
    client.release(); // Release the database client back to the pool.
    await pool.end(); // Close the pool, allowing the script to exit.
    console.log('--- Database reset finished. Pool has been closed. ---');
  }
}

// Run the main function and handle any potential errors.
resetDatabase().catch(() => {
  process.exit(1);
});
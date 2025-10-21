// ==========================================================
//  COMBINATION VALIDATION (For Customizer Page)
// ==========================================================
// This existing logic remains unchanged. It is used on the CarDetails page.

const validationRules = {
    incompatibleWith: {
      7: [8],
      8: [7],
    },
    requires: {
      10: [9],
    },
  };
  
  /**
   * Validates a set of selected customization options against predefined business rules.
   * @param {Array<Object>} selectedOptions - An array of the user's chosen customization objects.
   * @returns {Object} An object with `isValid` (boolean) and a `message` (string | null).
   */
  export const validateCombination = (selectedOptions) => {
    const selectedIds = new Set(selectedOptions.map(option => option.id));
  
    for (const option of selectedOptions) {
      const optionId = option.id;
      const incompatibleRules = validationRules.incompatibleWith[optionId];
      if (incompatibleRules) {
        for (const incompatibleId of incompatibleRules) {
          if (selectedIds.has(incompatibleId)) {
            return {
              isValid: false,
              message: `"${option.option_name}" is not compatible with an option you have selected.`,
            };
          }
        }
      }
      const requiredRules = validationRules.requires[optionId];
      if (requiredRules) {
        for (const requiredId of requiredRules) {
          if (!selectedIds.has(requiredId)) {
            return {
              isValid: false,
              message: `"${option.option_name}" requires another option that is not selected.`,
            };
          }
        }
      }
    }
  
    return { isValid: true, message: null };
  };
  
  
  // ==========================================================
  //  NEW: FORM INPUT VALIDATION (For Create/Edit Pages)
  // ==========================================================
  
  /**
   * A helper function that checks if a string value is not empty or just whitespace.
   * @param {string} value - The string to check.
   * @returns {boolean} - True if the string is not empty.
   */
  export const isNotEmpty = (value) => {
    return value && typeof value === 'string' && value.trim() !== '';
  };
  
  /**
   * A helper function that checks if a value can be parsed as a positive number.
   * @param {string|number} value - The value to check.
   * @returns {boolean} - True if the value is a number greater than 0.
   */
  export const isPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };
  
  /**
   * A helper function that checks if a number is a plausible year for a car.
   * We'll define "plausible" as being between 1950 and one year from the current year.
   * @param {string|number} value - The year to check.
   * @returns {boolean} - True if the year is valid.
   */
  export const isValidYear = (value) => {
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1950 && year <= currentYear + 1;
  };
  
  /**
   * This is the main validation function for our car creation/editing form.
   * It takes the entire form's data and returns an object of any errors found.
   * If the returned object is empty, the form is valid.
   * @param {Object} formData - The state object from your form, e.g., { name: '', year: '' }.
   * @returns {Object} - An object where keys are field names and values are error messages.
   */
  export const validateCarForm = (formData) => {
    const errors = {};
  
    // Rule 1: The model name must not be empty.
    if (!isNotEmpty(formData.name)) {
      errors.name = 'Model Name is a required field.';
    }
    
    // Rule 2: The year must be a valid, plausible year.
    if (!isValidYear(formData.year)) {
      errors.year = 'Please enter a valid year (e.g., 2024).';
    }
  
    // Rule 3: The base price must be a positive number.
    if (!isPositiveNumber(formData.base_price)) {
      errors.base_price = 'Base Price must be a positive number.';
    }
  
    // Add any other rules here, for example, for the description or image URL.
  
    return errors;
  };
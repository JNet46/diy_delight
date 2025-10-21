/**
 * Calculates the total price of a car by adding the price adjustments
 * of selected options to a base price.
 *
 * @param {number} basePrice The car's starting base price.
 * @param {Array<Object>} selectedOptions An array of customization objects that the user has selected.
 *        Each object is expected to have a `price_adjustment` property.
 * @returns {number} The calculated total price.
 */
export const calculateTotalPrice = (basePrice, selectedOptions) => {
    // Ensure we have valid inputs to prevent errors.
    if (typeof basePrice !== 'number' || !Array.isArray(selectedOptions)) {
      console.error("Invalid input for calculateTotalPrice");
      return basePrice || 0;
    }
  
    // Use the .reduce() method to sum up all the price adjustments.
    // It starts with the initial value of `basePrice`.
    // We use parseFloat to ensure price_adjustment is treated as a number.
    const optionsTotal = selectedOptions.reduce((total, option) => {
      const adjustment = parseFloat(option.price_adjustment);
      return total + (isNaN(adjustment) ? 0 : adjustment);
    }, 0);
  
    return basePrice + optionsTotal;
  };
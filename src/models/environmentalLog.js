// src/models/environmentalLog.js

// Defines the structure for an EnvironmentalLog,
// used for recording environmental conditions at various locations and times.

/**
 * Creates an EnvironmentalLog object.
 *
 * @param {Object} params - The parameters for creating an environmental log.
 * @param {string} params.logId - Unique ID for the log entry (e.g., ENVLOG-timestamp or UUID).
 * @param {string} params.locationId - Identifier for the location being monitored (e.g., "GerminationChamber1", "Greenhouse3-SectionB", "PropagationArea2").
 * @param {string} [params.timestamp] - ISO string for the date and time of the reading, defaults to now.
 * @param {number} params.temperatureCelsius - Temperature in degrees Celsius.
 * @param {number} params.relativeHumidityPercent - Relative humidity as a percentage (e.g., 65 for 65%).
 * @param {number} [params.lightIntensityLux] - Optional light intensity in Lux.
 * @param {string} [params.notes] - Optional notes about the reading or conditions.
 * @returns {Object} The created environmental log object.
 * @throws {Error} if logId, locationId, temperatureCelsius, or relativeHumidityPercent are missing or invalid.
 */
const createEnvironmentalLog = ({
  logId,
  locationId,
  timestamp,
  temperatureCelsius,
  relativeHumidityPercent,
  lightIntensityLux = null, // Default to null if not provided
  notes = '',
}) => {
  if (!logId || logId.trim() === '') {
    throw new Error('Log ID is required.');
  }
  if (!locationId || locationId.trim() === '') {
    throw new Error('Location ID is required.');
  }
  if (typeof temperatureCelsius !== 'number') {
    // Allow for 0 degrees, but it must be a number.
    throw new Error('Temperature in Celsius must be a number.');
  }
  if (typeof relativeHumidityPercent !== 'number' || relativeHumidityPercent < 0 || relativeHumidityPercent > 100) {
    throw new Error('Relative humidity must be a number between 0 and 100.');
  }
  if (lightIntensityLux !== null && (typeof lightIntensityLux !== 'number' || lightIntensityLux < 0)) {
    throw new Error('Light intensity in Lux must be a non-negative number if provided.');
  }

  return {
    logId: logId.trim(),
    locationId: locationId.trim(),
    timestamp: timestamp || new Date().toISOString(),
    temperatureCelsius: parseFloat(temperatureCelsius.toFixed(2)), // Store with 2 decimal places
    relativeHumidityPercent: parseFloat(relativeHumidityPercent.toFixed(1)), // Store with 1 decimal place
    lightIntensityLux: lightIntensityLux !== null ? parseFloat(lightIntensityLux.toFixed(0)) : null, // Store as integer if provided
    notes: notes.trim(),
    // Future fields could include:
    // - CO2_ppm
    // - soilMoisturePercent (if location is a specific pot/bed)
    // - loggedByEmployeeId
  };
};

// Example usage (conceptual):
// try {
//   const envLog1 = createEnvironmentalLog({
//     logId: `ENV-${Date.now()}`,
//     locationId: 'GerminationChamber1',
//     temperatureCelsius: 22.5,
//     relativeHumidityPercent: 60,
//     lightIntensityLux: 5000,
//     notes: 'Conditions stable for new seedlings.'
//   });
//   console.log(envLog1);

//   const envLog2 = createEnvironmentalLog({
//     logId: `ENV-${Date.now() + 1}`,
//     locationId: 'Greenhouse3-SectionB',
//     temperatureCelsius: 18.235,
//     relativeHumidityPercent: 75.66,
//     notes: 'Evening temperature drop noted.'
//   });
//   console.log(envLog2);
// } catch (e) {
//   console.error(e.message);
// }

export { createEnvironmentalLog };

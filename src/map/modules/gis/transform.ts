import * as turf from '@turf/turf';

/**
 * GPS -> Local AR space (Cartesian x, z)
 * Origin is [lng, lat]
 * Output is [x, z] in meters
 */
export const gpsToLocal = (origin: [number, number], target: [number, number]): [number, number] => {
  const distance = turf.distance(origin, target, { units: 'meters' });
  const bearing = turf.bearing(origin, target);
  
  // Math.sin/cos expect radians
  // bearing is degrees from North (0), clockwise (90 = East)
  // In Three.js: 
  // +X is East, -X is West
  // +Z is South, -Z is North
  const bearingRad = (bearing * Math.PI) / 180;
  
  const x = distance * Math.sin(bearingRad);
  const z = -distance * Math.cos(bearingRad);
  
  return [x, z];
};

/**
 * Local AR space (Cartesian x, z) -> GPS
 * Origin is [lng, lat]
 * Input is [x, z] in meters
 */
export const localToGps = (origin: [number, number], localPoint: [number, number]): [number, number] => {
  const [x, z] = localPoint;
  
  // distance = sqrt(x^2 + z^2)
  const distance = Math.sqrt(x * x + z * z);
  
  // bearing = atan2(x, -z) (since -z is North)
  // atan2 returns radians between -PI and PI
  const bearingRad = Math.atan2(x, -z);
  const bearingDeg = (bearingRad * 180) / Math.PI;
  
  const destination = turf.destination(origin, distance, bearingDeg, { units: 'meters' });
  
  return destination.geometry.coordinates as [number, number];
};

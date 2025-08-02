const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});
require('dotenv').config();

exports.geocodeAddress = async (address) => {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    const { lat, lng } = response.data.results[0].geometry.location;
    return {
      type: 'Point',
      coordinates: [lng, lat],
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Could not geocode address');
  }
};

exports.getOptimizedRoute = async (start, pickup, delivery) => {
  try {
    const response = await client.directions({
      params: {
        origin: `${start.coordinates[1]},${start.coordinates[0]}`,
        waypoints: [
          {
            location: `${pickup.coordinates[1]},${pickup.coordinates[0]}`,
            stopover: true,
          },
        ],
        destination: `${delivery.coordinates[1]},${delivery.coordinates[0]}`,
        optimizeWaypoints: true,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    const route = response.data.routes[0];
    const legs = route.legs;
    
    return {
      distance: legs.reduce((sum, leg) => sum + leg.distance.value, 0),
      duration: legs.reduce((sum, leg) => sum + leg.duration.value, 0),
      polyline: route.overview_polyline.points,
      waypointOrder: route.waypoint_order,
      steps: legs.flatMap(leg => leg.steps),
    };
  } catch (error) {
    console.error('Route optimization error:', error);
    throw new Error('Could not optimize route');
  }
};
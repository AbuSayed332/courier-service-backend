const crypto = require('crypto');

module.exports.generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TRK${timestamp}${random}`;
};
const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcel.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', parcelController.createParcel);
router.get('/', parcelController.getCustomerParcels);
router.get('/:id', parcelController.getParcelDetails);
router.get('/:id/tracking', parcelController.getParcelTracking);

module.exports = router;
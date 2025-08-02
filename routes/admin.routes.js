const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/parcels', adminController.getAllParcels);
router.put('/parcels/:id/assign', adminController.assignAgent);
router.get('/metrics', adminController.getDashboardMetrics);
router.get('/users', adminController.getAllUsers);

module.exports = router;
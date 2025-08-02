const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware, roleMiddleware(['agent']));

router.get('/parcels', agentController.getAssignedParcels);
router.put('/parcels/:id/status', agentController.updateParcelStatus);
router.get('/parcels/:id/route', agentController.getOptimizedRoute);
router.put('/location', agentController.updateAgentLocation);

module.exports = router;
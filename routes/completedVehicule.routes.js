const { addCompletedVehicleWithUser, getAllCompletedVehicles } = require("../controllers/completedVehicule.controller");
const { getCompletedVehiclesByUser } = require("../controllers/vehicle.controller");
const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/api/completed", addCompletedVehicleWithUser);
router.get("/api/completed", getAllCompletedVehicles);
router.get('/api/user/completed',  requireAuth, getCompletedVehiclesByUser);

module.exports = router;

const { addVehicleWithUser, getAllVehicles, getVehiclesByUser } = require("../controllers/vehicle.controller");
const { requireAuth } = require("../middleware/authMiddleware");
const router = require("express").Router();

router.post("/api/vehicles", addVehicleWithUser);
router.get("/api/vehicles", getAllVehicles);
router.get('/api/user/vehicles',  requireAuth, getVehiclesByUser);

module.exports = router;

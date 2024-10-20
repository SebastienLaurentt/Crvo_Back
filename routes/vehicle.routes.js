const {
  getAllVehicles,
  getVehiclesByUser,
} = require("../controllers/vehicle.controller");
const { requireAuth } = require("../middleware/authMiddleware");
const router = require("express").Router();

router.get("/api/vehicles", requireAuth, getAllVehicles);
router.get("/api/user/vehicles", requireAuth, getVehiclesByUser);

module.exports = router;

const {
  addCompletedVehicleWithUser,
  getAllCompletedVehicles,
  getCompletedVehiclesByUser,
} = require("../controllers/completedVehicule.controller");

const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post("/api/completed", addCompletedVehicleWithUser);
router.get("/api/completed", getAllCompletedVehicles);
router.get("/api/user/completed", requireAuth, getCompletedVehiclesByUser);

module.exports = router;

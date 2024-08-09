const { addVehicleWithUser, getAllVehicles } = require("../controllers/vehicle.controller");
const router = require("express").Router();

router.post("/api/vehicles", addVehicleWithUser);
router.get("/api/vehicles", getAllVehicles);

module.exports = router;

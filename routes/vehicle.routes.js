const { addVehicleWithUser } = require("../controllers/vehicle.controller");
const router = require("express").Router();

router.post("/api/vehicles", addVehicleWithUser);

module.exports = router;

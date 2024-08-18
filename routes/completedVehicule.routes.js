const { addCompletedVehicleWithUser, getAllCompletedVehicles } = require("../controllers/completedVehicule.controller");

const router = require("express").Router();

router.post("/api/completed", addCompletedVehicleWithUser);
router.get("/api/completed", getAllCompletedVehicles);

module.exports = router;

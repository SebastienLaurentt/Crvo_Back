const {
  addCompletedVehicleWithUser,
} = require("../controllers/completedVehicule.controller");

const router = require("express").Router();

router.post("/api/completed", addCompletedVehicleWithUser);

module.exports = router;

const express = require("express");
const cors = require("cors");
const app = express();
const vehicleController = require("./controllers/vehicle.controller");
const bodyParser = require("body-parser");
const cron = require("node-cron");

require("dotenv").config({ path: "./.env" });
require("./config/db");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/", require("./routes/vehicle.routes"));
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/synchronization.routes"));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  const updateVehicleData = async () => {
    console.log("Lancement de la synchronisation des véhicules");
    try {
      await vehicleController.runVehicleSynchronization();
      console.log("Synchronisation des véhicules terminée");
    } catch (err) {
      console.error("Erreur lors de la synchronisation des véhicules:", err);
    }
  };

  cron.schedule("5 * * * *", () => {
    updateVehicleData();
  });
});

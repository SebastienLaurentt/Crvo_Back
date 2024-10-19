const express = require("express");
const cors = require("cors");
const app = express();
const vehicleController = require("./controllers/vehicle.controller");

require("dotenv").config({ path: "./.env" });
require("./config/db");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());


app.use("/", require("./routes/vehicle.routes"));
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/synchronization.routes"));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  const runVehicleImport = () => {
    console.log("Exécution de l'importation des véhicules au démarrage");
    vehicleController
      .initializeVehicleData()
      .then(() =>
        console.log("Initialisation des données de véhicules terminée")
      )
      .catch((err) =>
        console.error(
          "Erreur lors de l'initialisation des données de véhicules:",
          err
        )
      );
  };

  runVehicleImport();
});

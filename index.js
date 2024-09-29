const express = require("express");
const cors = require("cors");
const app = express();
const testController = require("./controllers/test.controller");
const vehicleController = require("./controllers/vehicle.controller");

require("dotenv").config({ path: "./.env" });
require("./config/db");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Autres routes si nécessaire
app.use("/", require("./routes/completedVehicule.routes"));
app.use("/", require("./routes/vehicle.routes"));
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/cleanUpVehicle.routes"));
app.use("/", require("./routes/cleanUpCompletedVehicle.routes"));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  // Initialise les données de test après le démarrage du serveur
  // testController
  //   .initializeTestData()
  //   .then(() => console.log("Initialisation des données de test terminée"))
  //   .catch((err) =>
  //     console.error("Erreur lors de l'initialisation des données de test:", err)
  //   );

  // Initialise les données de véhicules après le démarrage du serveur
  vehicleController
    .initializeVehicleData()
    .then(() => console.log("Initialisation des données de véhicules terminée"))
    .catch((err) =>
      console.error("Erreur lors de l'initialisation des données de véhicules:", err)
    );
});

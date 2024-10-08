const express = require("express");
const cors = require("cors");
const cron = require('node-cron');
const app = express();
const vehicleController = require("./controllers/vehicle.controller");
const completedVehicleController = require("./controllers/completedVehicule.controller");

require("dotenv").config({ path: "./.env" });
require("./config/db");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Routes
app.use("/", require("./routes/completedVehicule.routes"));
app.use("/", require("./routes/vehicle.routes"));
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/cleanUpVehicle.routes"));
app.use("/", require("./routes/cleanUpCompletedVehicle.routes"));

// const server = app.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);

//   // Fonction pour exécuter l'importation des véhicules
//   const runVehicleImport = () => {
//     console.log('Exécution de l\'importation horaire des véhicules');
//     vehicleController
//       .initializeVehicleData()
//       .then(() => console.log("Initialisation des données de véhicules terminée"))
//       .catch((err) =>
//         console.error(
//           "Erreur lors de l'initialisation des données de véhicules:",
//           err
//         )
//       );
//   };

//   cron.schedule('0 * * * *', runVehicleImport);

// });

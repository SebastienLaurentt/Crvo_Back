const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Chargement des variables d'environnement
require("dotenv").config({ path: "./.env" });

// Connexion à la base de données
require("./config/db");

const app = express();

// Middleware pour parser le corps des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration CORS détaillée
app.use(
  cors({
    origin: "*", // En production, remplacez par l'URL de votre frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Gestion explicite des requêtes préliminaires (preflight)
app.options("*", cors());

// Middleware pour ajouter des en-têtes CORS supplémentaires si nécessaire
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// Routes
app.use("/", require("./routes/completedVehicule.routes"));
app.use("/", require("./routes/vehicle.routes"));
app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/cleanUpVehicle.routes"));
app.use("/", require("./routes/cleanUpCompletedVehicle.routes"));

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

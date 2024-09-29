const express = require('express');
const cors = require('cors');
const app = express();

require("dotenv").config({ path: "./.env" });
require("./config/db");

const bodyParser = require("body-parser");
const { connectToFTP } = require('./services/ftpServices');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Routes existantes
app.use("/", require("./routes/completedVehicule.routes")); 
app.use("/", require("./routes/vehicle.routes")); 
app.use("/", require("./routes/user.routes")); 
app.use("/", require("./routes/cleanUpVehicle.routes")); 
app.use("/", require("./routes/cleanUpCompletedVehicle.routes"));


connectToFTP()
  .then(client => {
    client.close();
  })
  .catch(err => {
    console.error('Erreur lors de la connexion FTP:', err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
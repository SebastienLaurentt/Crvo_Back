const express = require('express');
const cors = require('cors');
const app = express();

require("dotenv").config({ path: "./.env" });
require("./config/db");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/", require("./routes/completedVehicule.routes")); 
app.use("/", require("./routes/vehicle.routes")); 
app.use("/", require("./routes/user.routes")); 
app.use("/", require("./routes/cleanup.routes")); 

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
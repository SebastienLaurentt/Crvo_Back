const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const cron = require("node-cron");
const {
  syncRegularFiles,
  syncNightlyFiles,
  updateVehicleData,
} = require("./services/syncInit");

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

  cron.schedule("26 6-22 * * *", updateVehicleData);
  cron.schedule("26 6-22 * * *", syncRegularFiles);
  cron.schedule("1 18 * * *", syncNightlyFiles);
});

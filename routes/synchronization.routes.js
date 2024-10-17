const express = require('express');
const router = express.Router();
const { getLatestSynchronizationDate } = require("../controllers/synchronization.controller");

router.get("/api/synchronization", getLatestSynchronizationDate);

module.exports = router;

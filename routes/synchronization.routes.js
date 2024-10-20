const express = require("express");
const router = express.Router();
const {
  getLatestSynchronizationDate,
} = require("../controllers/synchronization.controller");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/api/synchronization", requireAuth, getLatestSynchronizationDate);

module.exports = router;
 
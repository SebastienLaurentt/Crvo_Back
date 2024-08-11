const { login, getAllUsers } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post('/login', login);
router.get('/api/users', requireAuth, getAllUsers);

module.exports = router;

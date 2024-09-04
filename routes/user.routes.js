const { login, getAllUsers, updateUser } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.post('/login', login);
router.get('/api/users', requireAuth, getAllUsers);
router.patch('/api/users/:id', requireAuth, updateUser); 

module.exports = router;

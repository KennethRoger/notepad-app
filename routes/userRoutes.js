const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, wasAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', wasAuthenticated, userController.loginPage);
router.post('/', userController.loginUser);
router.get('/register', wasAuthenticated, userController.registerPage);
router.post('/register', userController.registerUser);
router.get('/home', isAuthenticated, userController.homePage);
router.post('/logout', userController.logoutUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const { wasAdminAuth, isAdminAuth } = require('../middlewares/authMiddleware');

router.get('/', wasAdminAuth, adminController.loginPage);
router.post('/', adminController.loginAdmin);
router.get('/dashboard', isAdminAuth, adminController.adminDashboard);
router.get('/dashboard/search-user', isAdminAuth, adminController.adminSearchUser);
router.post('/dashboard/add-user', isAdminAuth, adminController.adminAddUser);
router.post('/dashboard/edit-user', isAdminAuth, adminController.adminEditUser);
router.post('/dashboard/delete-user', isAdminAuth, adminController.adminDeleteUser);
router.post('/logout', adminController.logoutAdmin);

module.exports = router;